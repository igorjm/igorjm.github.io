# Known Data Gaps — Igor Melo

Agents must **not invent** information listed here. Ask the user or read the resume PDF when relevant.

## Missing from portfolio codebase

| Field | Status | Action |
|-------|--------|--------|
| Education (degree, institution, year) | Unknown | Ask user or extract from resume PDF |
| Certifications | Unknown | Ask user |
| Spoken languages (beyond EN/PT inference) | Unknown | Confirm with user |
| LinkedIn headline (live) | Not synced | User to paste in `linkedin-baseline.md` |
| LinkedIn About (live) | Not synced | User to paste in `linkedin-baseline.md` |
| Salary history / expectations | Private | Only in `goals.md` if user fills |
| Cognyte product names (public) | Partially anonymized | Use "investigative analytics platform" unless user approves names |

## Resume vs portfolio

- Resume PDF: `web/public/resume/igor_melo_frontend_engineer.pdf`
- Filename suggests **frontend engineer** positioning; portfolio says **Senior Software Engineer / full-stack**.
- Agents should flag inconsistencies and recommend unified positioning per target role.

## Orphan translation keys

These exist in `messages/*.json` but not in `projects.ts`:

- `mernClient`
- `mernApi`

Do not feature these in career materials unless user confirms they are active projects.

## LinkedIn baseline

See [linkedin-baseline.md](linkedin-baseline.md) for pasted current profile text (when provided).

## Validation rule

Before publishing CV/LinkedIn copy:

1. Cross-check dates and titles against `profile.md` (synced from portfolio).
2. Cross-check metrics against `achievements.md`.
3. If a fact is not in profile, achievements, goals, or user message — **ask, don't assume**.
