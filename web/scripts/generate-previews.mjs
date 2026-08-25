#!/usr/bin/env node
/**
 * Pre-generate project preview thumbnails so the portfolio never waits on a
 * Microlink cold start at runtime.
 *
 * For every project in lib/data/projects.ts that has a deployedUrl, this:
 *   1. fetches a screenshot from Microlink (same source used at runtime),
 *   2. downscales + compresses it to WebP with cwebp,
 *   3. writes it to public/projects/{id}.webp.
 *
 * projects.ts sets `previewImage` to that local file, so cards load instantly
 * from the GitHub Pages origin and only fall back to the live Microlink URL
 * if a local file is ever missing.
 *
 * Usage (from web/):
 *   npm run previews:generate            # all projects
 *   npm run previews:generate -- brewra  # only matching ids
 *
 * Requires: cwebp (brew install webp).
 */

import { execFile } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const exec = promisify(execFile);

const WEB_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");
const PROJECTS_TS = join(WEB_DIR, "lib/data/projects.ts");
const OUT_DIR = join(WEB_DIR, "public/projects");

const WIDTH = 1280;
const QUALITY = 80;

function normalizeUrl(raw) {
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "null") return null;
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/** Light regex parse so this stays in sync with projects.ts (single source of truth). */
async function readProjects() {
  const source = await readFile(PROJECTS_TS, "utf8");
  const re =
    /id:\s*"([^"]+)"[\s\S]*?deployedUrl:\s*(null|"[^"]+"|normalizeHomepageUrl\(\s*"[^"]+"\s*\))/g;
  const projects = [];
  let match;
  while ((match = re.exec(source)) !== null) {
    const id = match[1];
    let rawUrl = match[2];
    const wrapped = rawUrl.match(/normalizeHomepageUrl\(\s*"([^"]+)"\s*\)/);
    if (wrapped) rawUrl = `"${wrapped[1]}"`;
    const url = rawUrl === "null" ? null : normalizeUrl(rawUrl.replace(/"/g, ""));
    projects.push({ id, url });
  }
  return projects;
}

function microlinkUrl(deployedUrl) {
  const encoded = encodeURIComponent(deployedUrl);
  return `https://api.microlink.io/?url=${encoded}&screenshot=true&embed=screenshot.url&viewport.width=1280&viewport.height=720`;
}

async function generate(project) {
  if (!project.url) {
    return { ...project, ok: true, status: "skipped (no deployedUrl)" };
  }

  const res = await fetch(microlinkUrl(project.url), {
    headers: { accept: "image/png,image/*" },
  });
  if (!res.ok) {
    return { ...project, ok: false, status: `failed (HTTP ${res.status})` };
  }
  const buf = Buffer.from(await res.arrayBuffer());
  // PNG magic number guard — Microlink returns JSON on error.
  if (buf.length < 8 || buf[0] !== 0x89 || buf[1] !== 0x50) {
    return {
      ...project,
      ok: false,
      status: `failed (not an image: ${buf.toString("utf8", 0, 120)})`,
    };
  }

  const tmpPng = join(tmpdir(), `preview-${project.id}.png`);
  const outWebp = join(OUT_DIR, `${project.id}.webp`);
  await writeFile(tmpPng, buf);
  try {
    await exec("cwebp", [
      "-quiet",
      "-q",
      String(QUALITY),
      "-resize",
      String(WIDTH),
      "0",
      tmpPng,
      "-o",
      outWebp,
    ]);
  } catch (err) {
    if (err.code === "ENOENT") {
      throw new Error("cwebp not found — install it (brew install webp)", {
        cause: err,
      });
    }
    throw err;
  } finally {
    await rm(tmpPng, { force: true });
  }

  const { size } = await readFile(outWebp).then((b) => ({ size: b.length }));
  return { ...project, ok: true, status: `ok (${(size / 1024).toFixed(0)} KB)` };
}

async function main() {
  const filters = process.argv.slice(2);
  await mkdir(OUT_DIR, { recursive: true });

  const all = await readProjects();
  const targets = filters.length
    ? all.filter((p) => filters.some((f) => p.id.includes(f)))
    : all;

  if (targets.length === 0) {
    throw new Error(
      filters.length
        ? `No projects matched: ${filters.join(", ")}`
        : `No projects parsed from ${PROJECTS_TS}`
    );
  }

  console.log(`Generating ${targets.length} preview(s) → public/projects/\n`);
  const failures = [];
  for (const project of targets) {
    process.stdout.write(`  ${project.id.padEnd(28)} `);
    try {
      const result = await generate(project);
      console.log(result.status);
      if (!result.ok) failures.push({ id: project.id, reason: result.status });
    } catch (err) {
      console.log("error");
      console.error(`  ${project.id}:`, err);
      failures.push({ id: project.id, reason: err.message });
    }
  }

  if (failures.length) {
    throw new Error(
      `${failures.length}/${targets.length} preview(s) failed:\n` +
        failures.map((f) => `  ${f.id}: ${f.reason}`).join("\n")
    );
  }

  console.log("\nDone. Commit the .webp files under public/projects/.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
