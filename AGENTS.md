# Career Advisor Agents — Igor Melo

AI career advisor system for Igor Melo — HR + senior engineering recruiting expertise, grounded in this portfolio.

## Quick start

| Task | Invoke |
|------|--------|
| Career strategy, role fit | `@career-advisor` or skill `igor-career-advisor` |
| LinkedIn profile or posts | `@linkedin-specialist` or skill `igor-linkedin` |
| X profile, tweets, morning bot | `@x-specialist` or skill `igor-x` |
| CV / resume tailoring | `@cv-resume-specialist` or skill `igor-cv-resume` |
| Interview prep | `@tech-recruiting-coach` or skill `igor-job-application` |

Personal skills (all projects): `~/.cursor/skills/igor-*`

## Knowledge base

Location: [`.cursor/career/`](.cursor/career/)

| File | Purpose |
|------|---------|
| `profile.md` | Auto-synced facts from portfolio |
| `voice.md` | Brand voice and positioning |
| `achievements.md` | STAR stories for CV, posts, interviews |
| `goals.md` | Target roles and preferences (you maintain) |
| `gaps.md` | Missing data agents must not invent |
| `linkedin-baseline.md` | Current LinkedIn text for audits |
| `exports/linkedin-profile.pdf` | Latest LinkedIn PDF export (authoritative after manual edits) |
| `first-audit.md` | Initial advisor audit (baseline) |
| `references/` | LinkedIn, CV/ATS, tech recruiting playbooks |
| `content/` | Ready-to-publish LinkedIn posts, Projects copy, 8-week calendar |

### LinkedIn content series

Location: [`.cursor/career/content/`](.cursor/career/content/)

| File | Purpose |
|------|---------|
| [linkedin-posts.md](.cursor/career/content/linkedin-posts.md) | 8 bilingual posts — copy/paste |
| [linkedin-projects.md](.cursor/career/content/linkedin-projects.md) | Projects + Featured + GitHub pins (Phase 0) |
| [posting-calendar.md](.cursor/career/content/posting-calendar.md) | Schedule, checkboxes, metrics |
| [README.md](.cursor/career/content/README.md) | Quick start |

```
@linkedin-specialist Polish Post 1 from content/linkedin-posts.md before I publish
```

### X (Twitter) authority bot

Location: [`.cursor/career/content/x/`](.cursor/career/content/x/)

| File | Purpose |
|------|---------|
| [phase0-setup.md](.cursor/career/content/x/phase0-setup.md) | X Premium, Developer app, OAuth, secrets |
| [watchlist.md](.cursor/career/content/x/watchlist.md) | Inspiration accounts (@ArtificialAnlys, etc.) |
| [voice-x.md](.cursor/career/content/x/voice-x.md) | EN-first punchy tone |
| [rollout.md](.cursor/career/content/x/rollout.md) | 4-week dry-run → auto-post |
| [metrics.md](.cursor/career/content/x/metrics.md) | Weekly tracking |

**MCP:** copy [`.cursor/mcp.json.example`](.cursor/mcp.json.example) → `.cursor/mcp.json` (gitignored).

From **`web/`**:

```bash
npm run career:x:setup      # one-time OAuth
npm run career:x:brief      # morning briefing (X_DRY_RUN=true week 1)
npm run career:x:post       # post next scheduled slot
npm run career:x:pipeline   # brief + post first slot
```

```
@x-specialist Research today's AI trends and draft 3 tweets
```

### Sync after portfolio edits

```bash
node .cursor/career/scripts/sync-career-profile.mjs
```

### LinkedIn audit (repeatable)

**After LinkedIn changes:** export PDF → save as `.cursor/career/exports/linkedin-profile.pdf` → import → audit.

From **`web/`**:

```bash
npm run career:import-linkedin
npm run career:audit-linkedin -- --update-baseline
```

From **repo root**:

```bash
node .cursor/career/scripts/import-linkedin-pdf.mjs
node .cursor/career/scripts/audit-linkedin.mjs --update-baseline
```

Writes `.cursor/career/audits/YYYY-MM-DD-linkedin.md`.

> Live HTML fetch is often stale/partial. **PDF export + snapshot cache** is the source of truth after manual profile updates.

Cursor rule [`.cursor/rules/career-content-sync.mdc`](.cursor/rules/career-content-sync.mdc) applies when editing `web/messages/`, `web/lib/data/`, or resume files.

## Subagents

| Agent | File | Use when |
|-------|------|----------|
| `career-advisor` | [`.cursor/agents/career-advisor.md`](.cursor/agents/career-advisor.md) | Strategy, role fit, growth plans |
| `linkedin-specialist` | [`.cursor/agents/linkedin-specialist.md`](.cursor/agents/linkedin-specialist.md) | LinkedIn audits and posts |
| `x-specialist` | [`.cursor/agents/x-specialist.md`](.cursor/agents/x-specialist.md) | X audits, tweets, trend research |
| `cv-resume-specialist` | [`.cursor/agents/cv-resume-specialist.md`](.cursor/agents/cv-resume-specialist.md) | CV tailoring and ATS |
| `tech-recruiting-coach` | [`.cursor/agents/tech-recruiting-coach.md`](.cursor/agents/tech-recruiting-coach.md) | Interview prep, recruiter lens |

## Personal skills

| Skill | Path |
|-------|------|
| `igor-career-advisor` | `~/.cursor/skills/igor-career-advisor/` |
| `igor-linkedin` | `~/.cursor/skills/igor-linkedin/` |
| `igor-x` | `~/.cursor/skills/igor-x/` |
| `igor-cv-resume` | `~/.cursor/skills/igor-cv-resume/` |
| `igor-job-application` | `~/.cursor/skills/igor-job-application/` |

Skills resolve the knowledge base from this repo (`.cursor/career/`) or `~/workspace/igorjm.github.io/.cursor/career/` when working elsewhere.

## Languages

- Default: **English**
- **PT-BR** for Brazil market or when requested
- Same facts across languages

## Example prompts

```
Use career-advisor: Should I apply for this Staff Engineer role? [paste JD]

Use linkedin-specialist: Audit my About section and suggest EN + PT-BR rewrites

Use x-specialist: Draft 3 tweets on today's AI trends inspired by my watchlist

Use cv-resume-specialist: Tailor my Cognyte bullets for this job description

Use tech-recruiting-coach: Prep me for a system design interview on analytics pipelines
```

## Maintenance

1. Update portfolio content in `web/messages/` and `web/lib/data/`
2. Run sync script
3. Update `goals.md` when targets change
4. Paste live LinkedIn into `linkedin-baseline.md` after profile updates
