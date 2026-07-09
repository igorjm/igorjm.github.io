# First Career Advisor Audit — Igor Melo

**Date:** 2026-07-08 (updated after LinkedIn manual refresh)  
**Latest audit:** [audits/2026-07-09-linkedin.md](audits/2026-07-09-linkedin.md) — **8/10** post-update

---

## Status

| Phase | Score | Notes |
|-------|-------|-------|
| Pre-update (stale fetch) | 3/10 | Old headline, About, Cognyte boilerplate |
| **Post-update (PDF export)** | **8/10** | Aligned with portfolio — headline, About, Cognyte bullets |

---

## Remaining improvements (8 → 9/10)

1. **Pin skills:** Java, React.js, TypeScript, Spring Boot, PostgreSQL (replace Agile/Remote/OOP as top 3)
2. **Featured:** portfolio, MealPlan AI, Headshots AI, resume PDF
3. **Resume PDF filename:** still `frontend_engineer` — align for full-stack applications
4. **Optional:** Add education to portfolio site (`profile.md` sync doesn't include it yet)

---

## Workflow going forward

When you change LinkedIn:

1. LinkedIn → Save to PDF → `.cursor/career/exports/linkedin-profile.pdf`
2. `npm run career:import-linkedin` (from `web/`)
3. `npm run career:audit-linkedin -- --no-fetch --update-baseline`

See [exports/README.md](exports/README.md).
