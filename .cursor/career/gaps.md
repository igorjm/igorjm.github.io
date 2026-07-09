# Known Data Gaps — Igor Melo

Agents must **not invent** information listed here. Ask the user or read exported files when relevant.

## Resolved (from LinkedIn PDF export, 2026-07-08)

| Field | Value |
|-------|-------|
| Education | XP Educação — Postgrad Software Architecture (2025–2026, in progress) |
| Education | Full Cycle (2023–2024) |
| Education | XP Educação — MBA Fullstack Development (2020–2021) |
| Education | Rocketseat OmniStack 9.0 (2019) |
| Education | freeCodeCamp Front End Certificate (2018) |
| Languages | EN full professional, PT native, FR/IT/ES elementary |
| LinkedIn headline/About | Synced to `linkedin-baseline.md` from `exports/linkedin-profile.pdf` |
| Cognyte title | Senior Software Engineer (aligned with portfolio) |

## Still missing from portfolio site (not in `web/messages/` or `profile.ts`)

| Field | Status | Action |
|-------|--------|--------|
| Bachelor's degree (Sistemas de Informação) | Was on old LinkedIn, not in PDF export | Confirm if still on profile or removed |
| Education section on portfolio | Not on site | Optional — add to site if desired |
| Salary expectations | Private | Only in `goals.md` if user fills |
| Cognyte product names (public) | Anonymized | Use "investigative analytics platform" unless user approves names |

## LinkedIn vs portfolio consistency

| Item | Status |
|------|--------|
| Cognyte title & bullets | ✅ Aligned (post manual update) |
| Headline & About | ✅ Aligned with portfolio narrative |
| Resume PDF filename `frontend_engineer` | ⚠️ Still inconsistent — consider retitle for full-stack apps |
| Top pinned skills | ⚠️ Agile/Remote/OOP — recommend Java, React, TS, Spring Boot, PostgreSQL for search |
| Featured section | ⚠️ Confirm portfolio + AI projects + resume are linked |

## Source of truth for LinkedIn audits

1. **Primary:** `.cursor/career/exports/linkedin-profile.pdf` (user drops latest export)
2. **Parsed cache:** `.cursor/career/.cache/linkedin-snapshot.md` (auto-updated by import script)
3. **Baseline:** `.cursor/career/linkedin-baseline.md`
4. **Portfolio facts:** `.cursor/career/profile.md` (synced from site)

Run after LinkedIn changes:

```bash
# Copy new PDF to exports/linkedin-profile.pdf, then:
npm run career:import-linkedin   # from web/
npm run career:audit-linkedin    # from web/
```

## Orphan translation keys (portfolio)

These exist in `messages/*.json` but not in `projects.ts`: `mernClient`, `mernApi`

## Validation rule

Before publishing CV/LinkedIn copy:

1. Cross-check dates and titles against `profile.md` and `linkedin-baseline.md`
2. Cross-check metrics against `achievements.md`
3. Refresh PDF export when LinkedIn changes — do not rely on live HTML fetch alone
