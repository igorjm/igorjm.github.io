#!/usr/bin/env node
/**
 * Imports LinkedIn profile from PDF export into baseline + snapshot cache.
 *
 * Place PDF at: .cursor/career/exports/linkedin-profile.pdf
 *
 * Usage (repo root):
 *   node .cursor/career/scripts/import-linkedin-pdf.mjs
 *   node .cursor/career/scripts/import-linkedin-pdf.mjs --pdf path/to/export.pdf
 *
 * Usage (from web/):
 *   npm run career:import-linkedin
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../../..");
const CAREER_DIR = join(REPO_ROOT, ".cursor/career");
const DEFAULT_PDF = join(CAREER_DIR, "exports/linkedin-profile.pdf");
const BASELINE_MD = join(CAREER_DIR, "linkedin-baseline.md");
const SNAPSHOT_MD = join(CAREER_DIR, ".cache/linkedin-snapshot.md");

function parseArgs(argv) {
  const args = { pdf: DEFAULT_PDF };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--pdf") args.pdf = argv[++i];
    else if (argv[i] === "--help") {
      console.log(`Usage: import-linkedin-pdf.mjs [--pdf path]

Imports LinkedIn PDF export into linkedin-baseline.md and .cache/linkedin-snapshot.md.
Requires 'pdftotext' (poppler) OR an existing .cache/linkedin-snapshot.txt from manual extraction.`);
      process.exit(0);
    }
  }
  return args;
}

/** pdftotext being absent is a soft skip; anything else is a real failure. */
class MissingPdftotextError extends Error {}

function extractPdfText(pdfPath) {
  const txtSidecar = pdfPath.replace(/\.pdf$/i, ".txt");

  if (existsSync(txtSidecar)) {
    console.log(`Using sidecar text: ${txtSidecar}`);
    return readFileSync(txtSidecar, "utf-8");
  }

  try {
    execSync("which pdftotext", { stdio: "ignore" });
  } catch (err) {
    throw new MissingPdftotextError(
      `pdftotext not found. Install it (brew install poppler) or save the text export as:\n  ${txtSidecar}`,
      { cause: err }
    );
  }

  try {
    return execSync(`pdftotext -layout "${pdfPath}" -`, {
      encoding: "utf-8",
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (err) {
    throw new Error(
      `pdftotext failed on ${pdfPath}: ${err.message}. Save the text export as:\n  ${txtSidecar}`,
      { cause: err }
    );
  }
}

function parseLinkedInPdfText(text) {
  const profile = {
    name: "Igor Melo",
    headline: "",
    location: "",
    about: "",
    cognyteTitle: "",
    cognyteBullets: [],
    topSkills: [],
    education: [],
    languages: [],
  };

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Headline often appears after certifications block and name
  const headlineIdx = lines.findIndex((l) =>
    /Senior Software Engineer.*Full-Stack/i.test(l)
  );
  if (headlineIdx >= 0) {
    profile.headline = lines[headlineIdx];
    const next = lines[headlineIdx + 1] || "";
    if (/TypeScript|Product Engineering/i.test(next)) {
      profile.headline = `${profile.headline} ${next}`.replace(/\s+/g, " ").trim();
    }
  }

  const locLine = lines.find((l) =>
    /^Florianópolis, Santa Catarina, Brazil$/i.test(l)
  );
  if (locLine) profile.location = locLine;

  // Summary section
  const summaryStart = lines.findIndex((l) => l === "Summary");
  const expStart = lines.findIndex((l) => l === "Experience");
  if (summaryStart >= 0 && expStart > summaryStart) {
    profile.about = lines.slice(summaryStart + 1, expStart).join(" ");
    profile.about = formatAbout(profile.about);
  }

  // Top skills
  const skillsStart = lines.findIndex((l) => l === "Top Skills");
  const langsStart = lines.findIndex((l) => l === "Languages");
  if (skillsStart >= 0 && langsStart > skillsStart) {
    profile.topSkills = lines
      .slice(skillsStart + 1, langsStart)
      .filter((l) => !l.startsWith("(") && l.length > 2);
  }

  // Cognyte bullets (handle PDF line wraps)
  const cognyteIdx = lines.findIndex((l) => l === "Cognyte");
  if (cognyteIdx >= 0) {
    profile.cognyteTitle = lines[cognyteIdx + 1] || "Senior Software Engineer";
    const konvivaIdx = lines.findIndex((l) => l.startsWith("Konviva"));
    const end = konvivaIdx > cognyteIdx ? konvivaIdx : cognyteIdx + 25;
    const block = lines.slice(cognyteIdx + 4, end).join(" ");
    profile.cognyteBullets = [...block.matchAll(/[•●]\s*([^•●]+?)(?=\s*[•●]|$)/g)]
      .map((m) => m[1].replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  // Education — lines after "Education"
  const eduStart = lines.findIndex((l) => l === "Education");
  if (eduStart >= 0) {
    profile.education = lines.slice(eduStart + 1, eduStart + 15).filter(Boolean);
  }

  // Languages from sidebar
  if (langsStart >= 0) {
    const certStart = lines.findIndex((l) => l === "Certifications");
    const end = certStart > langsStart ? certStart : langsStart + 8;
    profile.languages = lines.slice(langsStart + 1, end).filter((l) =>
      /proficiency|Elementary|Native|Bilingual/i.test(l)
    );
  }

  return profile;
}

function formatAbout(raw) {
  let text = raw.replace(/&amp;/g, "&");
  text = text
    .replace(/EdTech\.At Cognyte,/i, "EdTech.\n\nAt Cognyte,")
    .replace(/product line\.Stack:/i, "product line.\n\nStack:")
    .replace(/Supabase\.English/i, "Supabase.\n\nEnglish")
    .replace(/opportunities\.Portfolio/i, "opportunities.\n\nPortfolio");
  return text.replace(/[ \t]+/g, " ").trim();
}

function buildBaseline(profile, date, pdfPath) {
  const bullets = profile.cognyteBullets.length
    ? profile.cognyteBullets.map((b) => `• ${b}`).join("\n")
    : "_(parse manually — check PDF)_";

  const skills = profile.topSkills.length
    ? profile.topSkills.map((s) => `- ${s}`).join("\n")
    : "- _(see PDF)_";

  return `# LinkedIn Baseline — Igor Melo

Profile URL: https://www.linkedin.com/in/igorjm

> **Last synced:** ${date} from LinkedIn PDF export (\`${pdfPath.replace(REPO_ROOT + "/", "")}\`).

---

## Headline (current)

\`\`\`
${profile.headline || "_(not parsed)_"}
\`\`\`

---

## About (current)

\`\`\`
${profile.about || "_(not parsed)_"}
\`\`\`

---

## Top skills (pinned)

${skills}

---

## Cognyte (current role)

**Title:** ${profile.cognyteTitle || "Senior Software Engineer"}

\`\`\`
${bullets}
\`\`\`

---

## Education (from PDF export)

${profile.education.length ? profile.education.map((e) => `- ${e}`).join("\n") : "<!-- see PDF -->"}

---

## Recommended skill pins (intl search)

Java · React.js · TypeScript · Spring Boot · PostgreSQL

---

## Featured (current)

<!-- Update manually -->

---

## Audit history

| Date | Notes |
|------|-------|
| ${date} | Imported from LinkedIn PDF export |
`;
}

function buildSnapshot(profile) {
  return `# Igor Melo

${profile.headline || "Senior Software Engineer"}

${profile.location || "Florianópolis, Santa Catarina, Brazil"}

## About

${profile.about || ""}

## Experience

### ${profile.cognyteTitle || "Senior Software Engineer"} - Cognyte (Current)

${profile.cognyteBullets.map((b) => `• ${b}`).join("\n")}

## Skills

${profile.topSkills.join(" • ") || "Java • Spring Boot • React • TypeScript • PostgreSQL"}

## Languages

${profile.languages.join("\n")}
`;
}

function main() {
  const args = parseArgs(process.argv);
  const date = new Date().toISOString().split("T")[0];

  if (!existsSync(args.pdf)) {
    console.error(`PDF not found: ${args.pdf}`);
    console.error("Export from LinkedIn → Save to PDF → place at exports/linkedin-profile.pdf");
    process.exit(1);
  }

  let text;
  try {
    text = extractPdfText(args.pdf);
  } catch (err) {
    if (!(err instanceof MissingPdftotextError)) throw err;
    console.warn(err.message);
    console.warn("\nUsing pre-built snapshot from manual sync (PDF present but not parsed).");
    process.exit(0);
  }

  const profile = parseLinkedInPdfText(text);
  mkdirSync(join(CAREER_DIR, ".cache"), { recursive: true });

  writeFileSync(BASELINE_MD, buildBaseline(profile, date, args.pdf), "utf-8");
  writeFileSync(SNAPSHOT_MD, buildSnapshot(profile), "utf-8");

  console.log(`Updated ${BASELINE_MD}`);
  console.log(`Updated ${SNAPSHOT_MD}`);
}

main();
