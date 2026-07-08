# First Career Advisor Audit — Igor Melo

**Date:** 2026-07-08  
**Scope:** Portfolio + proposed LinkedIn baseline + resume positioning  
**Live LinkedIn:** Not yet compared — paste into `linkedin-baseline.md` for diff audit

---

## Executive summary

Your portfolio presents a **strong Senior IC full-stack profile** with clear differentiators: complex domains (analytics, healthcare, EdTech), quantified impact (25% perf, 50% report time), hackathon-to-product story, and modern side projects. Main actions: unify **frontend vs full-stack** positioning across resume filename and applications, fill **education/gaps**, paste **live LinkedIn** for incremental audit, and add **Featured** links on LinkedIn.

**Overall readiness:** 7.5/10 for senior full-stack roles (global remote)

---

## Strengths (recruiter + hiring manager lens)

| Signal | Evidence |
|--------|----------|
| Senior tenure | 8+ years; Senior at Cognyte since Feb 2022 |
| Full-stack depth | Java/Spring + React/TS + PostgreSQL across roles |
| Measurable impact | 25% processing reduction; 50% report creation time cut |
| Domain complexity | Cognyte analytics, Animati healthcare, Konviva EdTech |
| Initiative | Hackathon AI → global product line |
| Leadership signals | Mentoring, cross-functional squads |
| Modern stack proof | MealPlan AI, Headshots AI, Brewra, Next.js 15 portfolio |
| Public presence | Live portfolio with project demos and bilingual support |

---

## Gaps and risks

| Issue | Severity | Action |
|-------|----------|--------|
| Resume filename `frontend_engineer` vs full-stack positioning | Medium | Retitle PDF or lead with full-stack summary for full-stack JDs |
| Education not in codebase | Medium | Add to CV/LinkedIn or confirm from resume PDF |
| Live LinkedIn unknown | Medium | Paste into `linkedin-baseline.md`; compare to proposed copy |
| Staff/EM bar | Low (for Senior roles) | Add multi-team impact stories when targeting Staff+ |
| Cognyte product names anonymized | Low | Fine for public materials; prep verbal depth for interviews |

---

## LinkedIn audit (proposed baseline)

| Section | Score | Notes |
|---------|-------|-------|
| Headline | 8/10 | Proposed headline is strong — role + stack + value |
| About | 8/10 | Metrics and domains present; add CTA is good |
| Experience | — | Sync bullets from portfolio when updating LinkedIn |
| Featured | 5/10 | Recommend adding portfolio, MealPlan AI, resume PDF |
| Skills | — | Pin Java, React, TypeScript, Spring Boot, PostgreSQL |

**Top 3 LinkedIn actions:**
1. Paste live profile into `linkedin-baseline.md` and diff against proposed copy
2. Set Featured: portfolio → best AI project → resume
3. Ensure Cognyte bullets include 25% metric and hackathon product story

---

## CV / ATS audit (portfolio-derived)

| Element | Status |
|---------|--------|
| Reverse chronological experience | OK |
| Metrics in bullets | OK — strong at Cognyte |
| Skills grouped by category | OK — matches `skills.ts` |
| 2-page allowance (8+ YOE) | OK if page 1 is impact-dense |
| Positioning consistency | **Fix** — align resume title with target role |

**Recommended Cognyte lead bullet (EN):**
> Refactored processing pipeline for investigative analytics platform (Java, React), reducing processing times by 25% while delivering dynamic reporting with JasperReports and Bold Report.

---

## Positioning recommendation

| Target | Lead positioning |
|--------|------------------|
| Global Senior Full-Stack | Java/Spring + React/TS + metrics + domains |
| Frontend-heavy Senior | React/TS/Next.js + Konviva + portfolio craft + full-stack foundation |
| Brazil market (PT-BR) | Same facts; use proposed PT-BR About in `linkedin-baseline.md` |

---

## Priority action list

1. **Paste live LinkedIn** into `linkedin-baseline.md` → run `@linkedin-specialist` audit
2. **Fill education** in `gaps.md` once confirmed (from resume or memory)
3. **Update resume PDF title** or summary if applying full-stack (not frontend-only)
4. **Set LinkedIn Featured** to portfolio + MealPlan AI + resume
5. **Update `goals.md`** when actively applying (timeline, compensation)
6. After any portfolio edit → `node .cursor/career/scripts/sync-career-profile.mjs`

---

## Sample next prompts

```
Use linkedin-specialist: Compare my live LinkedIn to linkedin-baseline.md and list gaps

Use cv-resume-specialist: Rewrite my Cognyte section for this JD: [paste]

Use career-advisor: Score my fit for Senior Full-Stack at [company]

Use tech-recruiting-coach: Prep STAR answers for Cognyte performance story
```
