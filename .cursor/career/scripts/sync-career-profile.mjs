#!/usr/bin/env node
/**
 * Regenerates factual sections of profile.md from portfolio sources.
 * Run from repo root: node .cursor/career/scripts/sync-career-profile.mjs
 */

import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../../..");
const WEB = join(REPO_ROOT, "web");

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function readText(path) {
  return readFileSync(path, "utf-8");
}

function parseResumePath(profileTs, assetsTs) {
  const direct = profileTs.match(/resumeUrl:\s*"([^"]+)"/);
  if (direct) return direct[1];
  if (/resumeUrl:\s*ASSETS\.resume/.test(profileTs)) {
    const asset = assetsTs.match(/resume:\s*"([^"]+)"/);
    if (asset) return asset[1];
  }
  return "/resume/igor_melo_frontend_engineer.pdf";
}

function parseProfile(ts, assetsTs) {
  const fields = {};
  for (const key of [
    "name",
    "location",
    "company",
    "githubUsername",
    "twitterHandle",
    "email",
    "phone",
  ]) {
    const match = ts.match(new RegExp(`${key}:\\s*"([^"]+)"`));
    if (match) fields[key] = match[1];
  }
  fields.resumeUrl = parseResumePath(ts, assetsTs);
  return fields;
}

function parseExperience(ts) {
  const entries = [];
  const regex = /\{\s*id:\s*"([^"]+)",\s*isCurrent:\s*(true|false)\s*\}/g;
  let match;
  while ((match = regex.exec(ts)) !== null) {
    entries.push({ id: match[1], isCurrent: match[2] === "true" });
  }
  return entries;
}

function parseProjects(ts) {
  const projects = [];
  const blocks = ts.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    const id = block.match(/id:\s*"([^"]+)"/)?.[1];
    const name = block.match(/name:\s*"([^"]+)"/)?.[1];
    const descriptionKey = block.match(/descriptionKey:\s*"([^"]+)"/)?.[1];
    const repoUrl = block.match(/repoUrl:\s*"([^"]+)"/)?.[1];
    const deployedUrl = block.match(/deployedUrl:\s*"([^"]+)"/)?.[1];
    const language = block.match(/language:\s*"([^"]+)"/)?.[1];
    const tagsMatch = block.match(/tags:\s*\[([^\]]+)\]/);
    const tags = tagsMatch
      ? [...tagsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      : [];
    if (id) {
      projects.push({ id, name, descriptionKey, repoUrl, deployedUrl, language, tags });
    }
  }
  return projects;
}

function parseSkillGroups(ts) {
  const groups = [];
  const blocks = ts.split(/\n  \{\n/).slice(1);
  for (const block of blocks) {
    const id = block.match(/id:\s*"([^"]+)"/)?.[1];
    const skillsMatch = block.match(/skills:\s*\[([^\]]+)\]/);
    const skills = skillsMatch
      ? [...skillsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
      : [];
    if (id) groups.push({ id, skills });
  }
  return groups;
}

function parseSocial(ts) {
  const links = {};
  for (const key of ["github", "linkedin", "twitter", "email"]) {
    const match = ts.match(new RegExp(`${key}:\\s*"([^"]+)"`));
    if (match) links[key] = match[1];
  }
  return links;
}

function resolveDescriptionKey(messages, key) {
  const parts = key.split(".");
  let value = messages;
  for (const part of parts) {
    value = value?.[part];
  }
  return typeof value === "string" ? value : key;
}

function buildProfileMarkdown({ profile, social, en, pt, experience, projects, skillGroups }) {
  const generatedAt = new Date().toISOString().split("T")[0];

  const experienceSection = experience
    .map(({ id, isCurrent }) => {
      const role = en.experience[id];
      const rolePt = pt.experience[id];
      if (!role) return "";
      return `### ${role.title} — ${role.company}${isCurrent ? " (current)" : ""}

- **Period:** ${role.period}
- **EN:** ${role.description}
- **PT-BR:** ${rolePt?.description ?? "—"}`;
    })
    .filter(Boolean)
    .join("\n\n");

  const projectsSection = projects
    .map((p) => {
      const descEn = resolveDescriptionKey(en, p.descriptionKey);
      const descPt = resolveDescriptionKey(pt, p.descriptionKey);
      return `### ${p.name}

- **Tags:** ${p.tags.join(", ")}
- **Language:** ${p.language ?? "—"}
- **Repo:** ${p.repoUrl}
- **Live:** ${p.deployedUrl ?? "—"}
- **EN:** ${descEn}
- **PT-BR:** ${descPt}`;
    })
    .join("\n\n");

  const skillsSection = skillGroups
    .map((g) => `- **${g.id}:** ${g.skills.join(", ")}`)
    .join("\n");

  return `# Igor Melo — Career Profile

> Auto-generated factual sections. Last synced: ${generatedAt}
> Run \`node .cursor/career/scripts/sync-career-profile.mjs\` after portfolio updates.
> Narrative voice and STAR stories live in \`voice.md\` and \`achievements.md\`.

## Identity

| Field | Value |
|-------|-------|
| Name | ${profile.name} |
| Location | ${profile.location} |
| Current company | ${profile.company} |
| Experience | ${en.about.facts.experience} |
| Focus | ${en.about.facts.focus} |

## Contact & Links

| Channel | URL |
|---------|-----|
| Email | ${profile.email} |
| Phone | ${profile.phone} |
| GitHub | ${social.github} |
| LinkedIn | ${social.linkedin} |
| Twitter/X | ${social.twitter} |
| Portfolio | https://igorjm.github.io |
| Resume PDF | https://igorjm.github.io${profile.resumeUrl} |

## Positioning (EN)

**Headline:** ${en.hero.headline}

**Subtitle:** ${en.hero.subtitle}

**About:** ${en.about.headline}

${en.about.body}

${en.about.body_secondary}

## Positioning (PT-BR)

**Headline:** ${pt.hero.headline}

**Subtitle:** ${pt.hero.subtitle}

**About:** ${pt.about.headline}

${pt.about.body}

${pt.about.body_secondary}

## Experience

${experienceSection}

## Projects

${projectsSection}

## Skills

${skillsSection}

## SEO / Metadata

- **Title (EN):** ${en.metadata.title}
- **Description (EN):** ${en.metadata.description}
- **Title (PT-BR):** ${pt.metadata.title}
- **Description (PT-BR):** ${pt.metadata.description}
`;
}

function main() {
  const en = readJson(join(WEB, "messages/en.json"));
  const pt = readJson(join(WEB, "messages/pt-BR.json"));
  const profile = parseProfile(
    readText(join(WEB, "lib/data/profile.ts")),
    readText(join(WEB, "lib/constants/assets.ts"))
  );
  const experience = parseExperience(readText(join(WEB, "lib/data/experience.ts")));
  const projects = parseProjects(readText(join(WEB, "lib/data/projects.ts")));
  const skillGroups = parseSkillGroups(readText(join(WEB, "lib/data/skills.ts")));
  const social = parseSocial(readText(join(WEB, "lib/constants/social.ts")));

  const markdown = buildProfileMarkdown({
    profile,
    social,
    en,
    pt,
    experience,
    projects,
    skillGroups,
  });

  const outPath = join(REPO_ROOT, ".cursor/career/profile.md");
  writeFileSync(outPath, markdown, "utf-8");
  console.log(`Synced ${outPath}`);
}

main();
