#!/usr/bin/env node
/**
 * Fetches public LinkedIn profile (or reads a snapshot), diffs against profile.md,
 * and writes a dated audit report.
 *
 * Usage (repo root):
 *   node .cursor/career/scripts/audit-linkedin.mjs
 *   node .cursor/career/scripts/audit-linkedin.mjs --update-baseline
 *
 * Usage (from web/ — recommended if your terminal cwd is web):
 *   npm run career:audit-linkedin
 *   npm run career:audit-linkedin -- --update-baseline
 *
 * For richest audits when HTML fetch is partial, save a markdown snapshot to:
 *   .cursor/career/.cache/linkedin-snapshot.md
 * Or export LinkedIn PDF to .cursor/career/exports/linkedin-profile.pdf and run:
 *   npm run career:import-linkedin
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, "../../..");
const CAREER_DIR = join(REPO_ROOT, ".cursor/career");
const CACHE_DIR = join(CAREER_DIR, ".cache");
const AUDITS_DIR = join(CAREER_DIR, "audits");
const PROFILE_MD = join(CAREER_DIR, "profile.md");
const BASELINE_MD = join(CAREER_DIR, "linkedin-baseline.md");
const DEFAULT_URL = "https://www.linkedin.com/in/igorjm";

const INTERNATIONAL_KEYWORDS = [
  "senior",
  "full-stack",
  "full stack",
  "java",
  "spring",
  "react",
  "typescript",
  "postgresql",
  "software engineer",
  "remote",
  "analytics",
];

const PORTFOLIO_METRICS = [
  "25%",
  "50%",
  "hackathon",
  "global product",
  "mentor",
];

const RECOMMENDED_PINNED_SKILLS = [
  "Java",
  "React.js",
  "TypeScript",
  "Spring Boot",
  "PostgreSQL",
];

const WEAK_HEADLINE_TERMS = [
  "enthusiast",
  "passionate",
  "ninja",
  "rockstar",
  "guru",
];

// --- CLI ---

function parseArgs(argv) {
  const args = {
    url: DEFAULT_URL,
    fromFile: null,
    updateBaseline: false,
    noFetch: false,
    saveRaw: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--from-file") args.fromFile = argv[++i];
    else if (arg === "--url") args.url = argv[++i];
    else if (arg === "--update-baseline") args.updateBaseline = true;
    else if (arg === "--no-fetch") args.noFetch = true;
    else if (arg === "--save-raw") args.saveRaw = true;
    else if (arg === "--help") {
      console.log(`Usage: node audit-linkedin.mjs [options]

Options:
  --from-file <path>   Use markdown/HTML snapshot instead of live fetch
  --url <url>          LinkedIn profile URL (default: ${DEFAULT_URL})
  --update-baseline    Write fetched headline/about to linkedin-baseline.md
  --no-fetch           Skip network; use --from-file or cache only
  --save-raw           Save raw fetch body to .cache/linkedin-raw.html
`);
      process.exit(0);
    }
  }
  return args;
}

// --- Fetch & parse LinkedIn ---

async function fetchLinkedIn(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    redirect: "follow",
  });
  if (!response.ok) {
    throw new Error(`LinkedIn fetch failed: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function decodeHtml(text) {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&hellip;/g, "…");
}

function extractMeta(html) {
  const pick = (regex) => decodeHtml(html.match(regex)?.[1]?.trim() ?? "");
  const ogTitle = pick(/property="og:title"\s+content="([^"]*)"/i);
  const ogDescription = pick(/property="og:description"\s+content="([^"]*)"/i);
  const metaDescription = pick(/name="description"\s+content="([^"]*)"/i);
  const description = ogDescription || metaDescription;

  let name = "";
  let headline = "";
  if (ogTitle) {
    const parts = ogTitle.replace(/\s*\|\s*LinkedIn\s*$/i, "").split(" - ");
    name = parts[0]?.trim() ?? "";
    if (parts.length === 2 && !parts[1].includes("|")) {
      headline = parts[1].trim();
    }
  }

  const headlineFromHtml = [
    ...html.matchAll(/class="text-body-medium break-words"[^>]*>([^<]+)</g),
  ]
    .map((m) => decodeHtml(m[1].trim()))
    .find((t) => t.length > 10 && !t.includes("LinkedIn"));

  if (headlineFromHtml) headline = headlineFromHtml;

  const aboutPreview = description.split("·")[0]?.trim() ?? "";

  return {
    source: "html-meta",
    fetchQuality: headline || aboutPreview ? "partial" : "minimal",
    name,
    headline,
    aboutPreview,
    ogDescription: description,
    location: extractField(description, /Location:\s*([^·]+)/i),
    currentCompany: extractField(description, /Experience:\s*([^·]+)/i),
    education: extractField(description, /Education:\s*([^·]+)/i),
    connections: extractField(description, /(\d+\+?\s*connections)/i),
  };
}

function extractField(text, regex) {
  const match = text.match(regex);
  return match ? match[1].trim() : "";
}

function parseMarkdownProfile(markdown) {
  const lines = markdown.split("\n");
  const profile = {
    source: "markdown",
    fetchQuality: "full",
    name: "",
    headline: "",
    about: "",
    location: "",
    connections: "",
    experience: [],
    skills: [],
    languages: [],
    education: [],
    projects: [],
    certifications: [],
    rawSections: {},
  };

  let section = "";
  let currentRole = null;
  let aboutLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.startsWith("# ") && !line.startsWith("## ")) {
      profile.name = line.replace(/^#\s+/, "").trim();
      for (let j = i + 1; j < Math.min(i + 4, lines.length); j++) {
        const candidate = lines[j].trim();
        if (candidate && !candidate.startsWith("#")) {
          profile.headline = candidate;
          i = j;
          break;
        }
      }
      continue;
    }

    if (line.startsWith("## ")) {
      if (section === "about" && aboutLines.length) {
        profile.about = aboutLines.join("\n").trim();
        aboutLines = [];
      }
      section = line.replace(/^##\s+/, "").toLowerCase();
      continue;
    }

    if (section === "about" && line && !line.startsWith("Total Experience")) {
      aboutLines.push(line);
    }

    if (section === "experience" && line.startsWith("### ")) {
      if (currentRole) profile.experience.push(currentRole);
      currentRole = { title: line.replace(/^###\s+/, "").trim(), body: [] };
      continue;
    }

    if (currentRole && section === "experience" && line) {
      currentRole.body.push(line);
    }

    if (section === "skills" && line) {
      const skillText = line.replace(/^Skills\s*/i, "");
      if (skillText.includes("•")) {
        profile.skills = skillText
          .split("•")
          .map((s) => s.trim())
          .filter(Boolean);
      } else if (skillText.includes(",")) {
        profile.skills = skillText
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
    }

    if (section === "languages" && line.includes(" - ")) {
      profile.languages.push(line);
    }

    if (section === "education" && line.startsWith("### ")) {
      profile.education.push(line.replace(/^###\s+/, "").trim());
    }

    if (section === "projects" && line.startsWith("### ")) {
      profile.projects.push(line.replace(/^###\s+/, "").trim());
    }

    if (section.includes("certification") && line.startsWith("### ")) {
      profile.certifications.push(line.replace(/^###\s+/, "").trim());
    }

    if (line.includes("connections") && line.includes("followers")) {
      profile.connections = line;
    }
    if (line.match(/,.+\(BR\)/)) profile.location = line;
  }

  if (currentRole) profile.experience.push(currentRole);
  if (aboutLines.length) profile.about = aboutLines.join("\n").trim();

  if (!profile.headline && profile.name) {
    const idx = markdown.indexOf(profile.name);
    if (idx >= 0) {
      const after = markdown.slice(idx + profile.name.length, idx + 300);
      const headMatch = after.match(/\n([^\n#]{10,120})\n/);
      if (headMatch) profile.headline = headMatch[1].trim();
    }
  }

  return profile;
}

function mergeProfiles(primary, secondary) {
  if (!primary) return secondary;
  if (!secondary) return primary;

  const merged = { ...primary };
  for (const [key, value] of Object.entries(secondary)) {
    if (value == null || value === "") continue;
    if (Array.isArray(value) && value.length === 0) continue;

    const current = merged[key];
    const currentEmpty =
      current == null ||
      current === "" ||
      (Array.isArray(current) && current.length === 0);

    if (currentEmpty) {
      merged[key] = value;
    }
  }

  if (primary.fetchQuality === "full") merged.fetchQuality = "full";
  return merged;
}

// --- Parse profile.md (portfolio source of truth) ---

function parsePortfolioProfile(markdown) {
  const cognyteBlock = markdown.match(
    /### Senior Software Engineer — Cognyte[\s\S]*?(?=\n### |\n## |$)/
  )?.[0] ?? "";

  const skillsBlock = markdown.match(/## Skills\n([\s\S]*?)(?=\n## |$)/)?.[1] ?? "";
  const skills = [...skillsBlock.matchAll(/:\s*([^\n]+)/g)].flatMap((m) =>
    m[1].split(",").map((s) => s.trim())
  );

  const subtitle = markdown.match(/\*\*Subtitle:\*\*\s*(.+)/)?.[1]?.trim() ?? "";
  const aboutBody = markdown.match(
    /## Positioning \(EN\)\n[\s\S]*?\*\*About:\*\*[^\n]*\n\n([\s\S]*?)(?=\n## Positioning \(PT-BR\)|$)/
  )?.[1]?.trim() ?? "";

  const projects = [...markdown.matchAll(/^### (.+)$/gm)]
    .map((m) => m[1].trim())
    .filter((name) => !name.includes("—"));

  return {
    expectedTitle: "Senior Software Engineer",
    expectedCompany: "Cognyte",
    subtitle,
    aboutBody,
    cognyteBlock,
    skills: [...new Set(skills)],
    projects,
    portfolioUrl: "https://igorjm.github.io",
    metrics: PORTFOLIO_METRICS,
  };
}

// --- Audit logic ---

function scoreHeadline(headline, portfolio) {
  const h = (headline || "").toLowerCase();
  const issues = [];
  const good = [];
  let score = 5;

  if (!headline) {
    return { score: 0, issues: ["Headline not detected in fetch"], good: [] };
  }

  if (h.includes("senior")) {
    good.push("Contains seniority signal");
    score += 1;
  } else issues.push('Missing "Senior" keyword');

  if (h.includes("full-stack") || h.includes("full stack")) {
    good.push("Full-stack keyword present");
    score += 1;
  } else issues.push('Missing "Full-Stack" (common recruiter search term)');

  for (const kw of ["java", "react", "typescript"]) {
    if (h.includes(kw)) good.push(`Stack keyword: ${kw}`);
    else issues.push(`Missing stack keyword: ${kw}`);
  }

  for (const weak of WEAK_HEADLINE_TERMS) {
    if (h.includes(weak)) {
      issues.push(`Weak term for international recruiters: "${weak}"`);
      score -= 2;
    }
  }

  if (!h.includes("analytics") && !h.includes("product") && !h.includes("engineering")) {
    issues.push("No domain/value prop (analytics, product engineering)");
  } else {
    good.push("Domain or value prop present");
    score += 1;
  }

  return { score: clamp(score, 0, 10), issues, good };
}

function scoreAbout(about, portfolio) {
  const text = (about || "").toLowerCase();
  const issues = [];
  const good = [];
  let score = 5;

  if (!about || about.length < 40) {
    return {
      score: 2,
      issues: ["About missing or too short in fetch — paste full About in snapshot"],
      good: [],
    };
  }

  if (text.includes("software developer") && !text.includes("senior software engineer")) {
    issues.push('Junior framing: "software developer" without Senior title');
    score -= 2;
  }
  if (text.includes("nearly 8") && !text.includes("8+")) {
    issues.push('Weaker experience framing: "nearly 8 years" vs portfolio "8+"');
    score -= 1;
  }
  if (text.includes("senior") || text.includes("8+") || text.includes("8 years")) {
    good.push("Seniority/years mentioned");
    score += 1;
  }

  for (const metric of portfolio.metrics) {
    if (text.includes(metric.replace("%", "")) || text.includes(metric)) {
      good.push(`Impact metric present: ${metric}`);
      score += 1;
    }
  }
  const hasMetric = /25%|50%|hackathon|global product/i.test(about);
  if (!hasMetric) {
    issues.push("Missing quantified wins (25%, 50%, hackathon → product)");
    score -= 2;
  }

  if (text.includes("igorjm.github.io") || text.includes("portfolio")) {
    good.push("Portfolio link in About");
    score += 1;
  } else issues.push("No portfolio URL in About");

  if (text.includes("remote") || text.includes("global")) {
    good.push("International/remote signal");
    score += 1;
  } else issues.push('No "global remote" signal for international recruiters');

  if (text.includes("english")) {
    good.push("English proficiency mentioned");
    score += 1;
  }

  return { score: clamp(score, 0, 10), issues, good };
}

function scoreExperience(linkedin, portfolio) {
  const issues = [];
  const good = [];
  let score = 6;

  const cognyte = linkedin.experience?.find(
    (e) => e.title?.toLowerCase().includes("cognyte") || e.title?.toLowerCase().includes("full stack")
  );

  if (!cognyte && linkedin.currentCompany?.toLowerCase().includes("cognyte")) {
    good.push("Current company: Cognyte (from meta)");
  } else if (cognyte) {
    good.push("Cognyte experience listed");
  } else {
    issues.push("Cognyte role not clearly detected");
    score -= 2;
  }

  if (cognyte) {
    const body = cognyte.body.join(" ").toLowerCase();
    const title = cognyte.title.toLowerCase();

    if (title.includes("full stack") && !title.includes("senior")) {
      issues.push('LinkedIn title "Full Stack Engineer" vs portfolio "Senior Software Engineer"');
      score -= 2;
    }
    if (title.includes("senior")) {
      good.push("Senior in current role title");
      score += 1;
    }

    const hasMetric = /25%|50%|reduced|cut/i.test(body);
    if (!hasMetric) {
      issues.push("Cognyte description lacks quantified impact bullets");
      score -= 2;
    } else good.push("Metrics in Cognyte experience");

    if (body.length > 800 && body.includes("global leader")) {
      issues.push("Cognyte block is company boilerplate — replace with impact bullets");
      score -= 1;
    }
  }

  if (!portfolio.cognyteBlock.toLowerCase().includes("25%")) {
    issues.push("Portfolio sync: ensure 25% metric in profile.md Cognyte block");
  }

  return { score: clamp(score, 0, 10), issues, good };
}

function scoreSkills(linkedinSkills, portfolio) {
  const issues = [];
  const good = [];
  let score = 5;

  if (!linkedinSkills?.length) {
    return {
      score: 3,
      issues: ["Skills not detected — use markdown snapshot for skill audit"],
      good: [],
    };
  }

  const normalized = linkedinSkills.map((s) => s.toLowerCase());
  const noise = ["acting", "aos", "das", "nas", "ultrasound", "printer maintenance", "banking"];
  const noiseFound = noise.filter((n) => normalized.some((s) => s.includes(n)));
  if (noiseFound.length) {
    issues.push(`Irrelevant skills polluting search: ${noiseFound.join(", ")}`);
    score -= 3;
  }

  if (linkedinSkills.length > 40) {
    issues.push(`Too many skills listed (${linkedinSkills.length}) — curate to ~20`);
    score -= 2;
  }

  for (const skill of RECOMMENDED_PINNED_SKILLS) {
    if (normalized.some((s) => s.includes(skill.toLowerCase().replace(".js", "")))) {
      good.push(`Core skill present: ${skill}`);
    } else {
      issues.push(`Pin recommended skill: ${skill}`);
    }
  }

  return { score: clamp(score, 0, 10), issues, good };
}

function scoreDiscoverability(linkedin, portfolio) {
  const text = [
    linkedin.headline,
    linkedin.about,
    linkedin.aboutPreview,
    linkedin.ogDescription,
    ...(linkedin.experience || []).map((e) => e.title + " " + e.body.join(" ")),
  ]
    .join(" ")
    .toLowerCase();

  const found = [];
  const missing = [];
  for (const kw of INTERNATIONAL_KEYWORDS) {
    if (text.includes(kw)) found.push(kw);
    else missing.push(kw);
  }

  const score = clamp(Math.round((found.length / INTERNATIONAL_KEYWORDS.length) * 10), 0, 10);
  return { score, found, missing };
}

function scoreFeatured(linkedin) {
  const issues = [];
  const good = [];
  let score = 5;

  const projects = linkedin.projects || [];
  if (projects.some((p) => p.includes("igorjm.github.io"))) {
    good.push("Portfolio in projects/featured");
    score += 2;
  } else issues.push("Portfolio not in Featured/Projects");

  const hasAiProject = projects.some((p) =>
    /meal|headshot|brewra|saas|ai/i.test(p)
  );
  if (hasAiProject) good.push("AI/SaaS project featured");
  else issues.push("Add AI SaaS side project to Featured (MealPlan, Headshots, Brewra)");

  if (projects.length >= 3) good.push("Multiple featured items");
  else issues.push("Featured section underused — aim for 3–4 links");

  return { score: clamp(score, 0, 10), issues, good };
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function buildDiffs(linkedin, portfolio) {
  const diffs = [];

  if (linkedin.headline && portfolio.subtitle) {
    if (
      !linkedin.headline.toLowerCase().includes("senior") &&
      portfolio.expectedTitle.toLowerCase().includes("senior")
    ) {
      diffs.push({
        field: "Seniority in headline",
        linkedin: linkedin.headline,
        portfolio: portfolio.expectedTitle,
      });
    }
  }

  const cognyteRole = linkedin.experience?.[0];
  if (cognyteRole && !cognyteRole.title.includes("Senior")) {
    diffs.push({
      field: "Cognyte job title",
      linkedin: cognyteRole.title,
      portfolio: `${portfolio.expectedTitle} — ${portfolio.expectedCompany}`,
    });
  }

  return diffs;
}

function recommendedHeadline() {
  return "Senior Software Engineer | Full-Stack (Java, Spring Boot, React, TypeScript) | Investigative Analytics & Product Engineering";
}

function recommendedAboutSnippet() {
  return `Senior Software Engineer with 8+ years building full-stack product across investigative analytics, healthcare, and EdTech.

At Cognyte, I deliver features for a global intelligence analytics platform — 25% processing time reduction, dynamic reporting at scale, and a hackathon AI assistant adopted as a global product line.

Stack: Java, Spring Boot, React, TypeScript, PostgreSQL. Side projects: Next.js, AI, Stripe.

English (professional) · Florianópolis, Brazil · Open to global remote opportunities.
Portfolio → igorjm.github.io`;
}

// --- Report ---

function buildReport(linkedin, portfolio, args) {
  const date = new Date().toISOString().split("T")[0];
  const headline = scoreHeadline(linkedin.headline, portfolio);
  const about = scoreAbout(
    linkedin.about || linkedin.aboutPreview,
    portfolio
  );
  const experience = scoreExperience(linkedin, portfolio);
  const skills = scoreSkills(linkedin.skills, portfolio);
  const discoverability = scoreDiscoverability(linkedin, portfolio);
  const featured = scoreFeatured(linkedin);
  const diffs = buildDiffs(linkedin, portfolio);

  const overall = Math.round(
    (headline.score * 1.2 +
      about.score * 1.2 +
      experience.score * 1.1 +
      skills.score * 1.0 +
      discoverability.score * 1.0 +
      featured.score * 0.8) /
      6.3
  );

  const section = (name, result) => {
    const good = result.good?.length
      ? result.good.map((g) => `- ✅ ${g}`).join("\n")
      : "- _(none detected)_";
    const issues = result.issues?.length
      ? result.issues.map((i) => `- ⚠️ ${i}`).join("\n")
      : "- _(none)_";
    return `### ${name} — ${result.score}/10

**Good**
${good}

**Issues**
${issues}`;
  };

  const diffTable =
    diffs.length === 0
      ? "_No title/role diffs detected (or partial fetch)._"
      : diffs
          .map(
            (d) =>
              `| ${d.field} | ${d.linkedin.replace(/\|/g, "\\|")} | ${d.portfolio.replace(/\|/g, "\\|")} |`
          )
          .join("\n");

  return `# LinkedIn Audit — Igor Melo

**Date:** ${date}  
**Profile URL:** ${args.url}  
**Fetch quality:** ${linkedin.fetchQuality} (${linkedin.source})  
**Audience:** International senior full-stack recruiters (global remote)

> LinkedIn does not expose internal search analytics via public fetch. Scores reflect public profile SEO, recruiter scan, and alignment with \`profile.md\`.

---

## Overall score: ${overall}/10

| Dimension | Score |
|-----------|-------|
| Headline | ${headline.score}/10 |
| About | ${about.score}/10 |
| Experience | ${experience.score}/10 |
| Skills (search) | ${skills.score}/10 |
| Discoverability (keywords) | ${discoverability.score}/10 |
| Featured / projects | ${featured.score}/10 |

---

## Executive summary

${overall >= 8 ? "Strong public profile for international discovery — minor tuning recommended." : overall >= 6 ? "Solid experience but packaging under-optimized for global recruiter search." : "Profile under-represents senior impact — prioritize headline, About, Cognyte bullets, and skills curation."}

**Fetch note:** ${
    linkedin.fetchQuality === "full"
      ? "Full markdown snapshot parsed."
      : "Partial HTML meta fetch — re-run with `--from-file .cursor/career/.cache/linkedin-snapshot.md` after saving a richer snapshot for skills/experience detail."
  }

---

## Section analysis

${section("Headline", headline)}

${section("About", about)}

${section("Experience", experience)}

${section("Skills", skills)}

${section("Featured / Projects", featured)}

---

## International keyword coverage

**Found (${discoverability.found.length}/${INTERNATIONAL_KEYWORDS.length}):** ${discoverability.found.join(", ") || "—"}

**Missing:** ${discoverability.missing.join(", ") || "—"}

---

## Portfolio diffs

| Field | LinkedIn (detected) | Portfolio (expected) |
|-------|---------------------|----------------------|
${diffTable}

---

## Priority actions

1. **Headline** — use recommended EN headline below
2. **About** — rewrite with metrics + portfolio + remote signal
3. **Cognyte title** — align to **Senior Software Engineer**
4. **Cognyte bullets** — 5 impact bullets; remove company boilerplate
5. **Skills** — pin: ${RECOMMENDED_PINNED_SKILLS.join(", ")}; remove irrelevant legacy skills
6. **Featured** — portfolio, MealPlan AI, Headshots AI, resume PDF
7. Re-run: \`node .cursor/career/scripts/audit-linkedin.mjs\`

---

## Recommended copy (paste-ready)

### Headline (EN)
\`\`\`
${recommendedHeadline()}
\`\`\`

### About (EN) — excerpt
\`\`\`
${recommendedAboutSnippet()}
\`\`\`

---

## Detected profile snapshot

| Field | Value |
|-------|-------|
| Name | ${linkedin.name || "—"} |
| Headline | ${linkedin.headline || "—"} |
| About (preview) | ${(linkedin.about || linkedin.aboutPreview || "—").slice(0, 200)}${(linkedin.about || linkedin.aboutPreview || "").length > 200 ? "…" : ""} |
| Location | ${linkedin.location || "—"} |
| Company | ${linkedin.currentCompany || "—"} |
| Connections | ${linkedin.connections || "—"} |
| Experience entries | ${linkedin.experience?.length ?? 0} |
| Skills detected | ${linkedin.skills?.length ?? 0} |

---

_Generated by \`audit-linkedin.mjs\`. Compare with [@linkedin-specialist](.cursor/agents/linkedin-specialist.md) for narrative rewrites._
`;
}

function updateBaseline(linkedin) {
  if (existsSync(BASELINE_MD)) {
    console.log(`Skipped baseline overwrite — edit ${BASELINE_MD} manually or run career:import-linkedin`);
    return;
  }
  const headline = linkedin.headline || "_(not detected)_";
  const about = linkedin.about || linkedin.aboutPreview || "_(not detected)_";
  const date = new Date().toISOString().split("T")[0];

  const content = `# LinkedIn Baseline — Igor Melo

Profile URL: https://www.linkedin.com/in/igorjm

> Last auto-updated from public fetch: ${date}. Paste edits after you change LinkedIn.

---

## Headline (current)

\`\`\`
${headline}
\`\`\`

---

## About (current)

\`\`\`
${about}
\`\`\`

---

## Featured (current)

<!-- Update manually after LinkedIn changes -->

---

## Audit history

| Date | Notes |
|------|-------|
| ${date} | Auto-updated by audit-linkedin.mjs |
`;

  writeFileSync(BASELINE_MD, content, "utf-8");
  console.log(`Updated ${BASELINE_MD}`);
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv);

  if (!existsSync(PROFILE_MD)) {
    console.error(`Missing ${PROFILE_MD} — run sync-career-profile.mjs first.`);
    process.exit(1);
  }

  const portfolio = parsePortfolioProfile(readFileSync(PROFILE_MD, "utf-8"));
  let linkedin = null;

  const cacheSnapshot = join(CACHE_DIR, "linkedin-snapshot.md");
  const snapshotPath =
    args.fromFile || (existsSync(cacheSnapshot) ? cacheSnapshot : null);

  if (snapshotPath && existsSync(snapshotPath)) {
    linkedin = parseMarkdownProfile(readFileSync(snapshotPath, "utf-8"));
    console.log(`Parsed snapshot: ${snapshotPath}`);
  }

  if (!args.noFetch) {
    try {
      console.log(`Fetching ${args.url}…`);
      const html = await fetchLinkedIn(args.url);
      const metaProfile = extractMeta(html);

      if (args.saveRaw) {
        mkdirSync(CACHE_DIR, { recursive: true });
        const rawPath = join(CACHE_DIR, "linkedin-raw.html");
        writeFileSync(rawPath, html, "utf-8");
        console.log(`Saved raw HTML: ${rawPath}`);
      }

      if (looksLikeMarkdown(html)) {
        const mdProfile = parseMarkdownProfile(html);
        linkedin = mergeProfiles(linkedin, mdProfile);
      } else {
        linkedin = mergeProfiles(linkedin, metaProfile);
      }
    } catch (err) {
      console.warn(`Fetch warning: ${err.message}`);
      if (!linkedin) {
        if (existsSync(cacheSnapshot)) {
          linkedin = parseMarkdownProfile(readFileSync(cacheSnapshot, "utf-8"));
          console.log(`Fell back to cache: ${cacheSnapshot}`);
        } else {
          console.error("No snapshot available. Use --from-file or add .cache/linkedin-snapshot.md");
          process.exit(1);
        }
      }
    }
  }

  if (linkedin?.fetchQuality === "full") {
    linkedin.source = "markdown+html-meta";
  } else if (linkedin) {
    linkedin.source = linkedin.source || "html-meta";
  }

  if (!linkedin) {
    console.error("No LinkedIn data. Use --from-file, add .cache/linkedin-snapshot.md, or allow fetch.");
    process.exit(1);
  }

  const report = buildReport(linkedin, portfolio, args);
  mkdirSync(AUDITS_DIR, { recursive: true });
  const date = new Date().toISOString().split("T")[0];
  const outPath = join(AUDITS_DIR, `${date}-linkedin.md`);
  writeFileSync(outPath, report, "utf-8");
  console.log(`Wrote audit: ${outPath}`);

  if (args.updateBaseline) {
    updateBaseline(linkedin);
  }

  const overallMatch = report.match(/Overall score: (\d+)\/10/);
  console.log(`Overall: ${overallMatch?.[1] ?? "?"}/10 (${linkedin.fetchQuality} fetch)`);
}

function looksLikeMarkdown(text) {
  return text.includes("## About") && text.includes("## Experience");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
