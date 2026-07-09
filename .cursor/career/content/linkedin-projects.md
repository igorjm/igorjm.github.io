# LinkedIn Projects — Copy-Paste Entries

Use these when editing **LinkedIn → Add project**. Order matters for recruiter scan (top = strongest signal).

---

## 1. MealPlan AI

| Field | Value |
|-------|-------|
| **Project name** | MealPlan AI |
| **Associated with** | Personal project |
| **Start date** | 2024 |
| **End date** | Present |
| **Project URL** | https://nextjs-meal-plan-saas.vercel.app |

**Description:**

```
AI-powered meal planning SaaS with authentication, subscriptions, and LLM-generated plans. Full-stack delivery with Next.js, TypeScript, Clerk, and Stripe — demonstrates end-to-end product ownership beyond enterprise day-to-day work.
```

---

## 2. Headshots AI

| Field | Value |
|-------|-------|
| **Project name** | Headshots AI |
| **Project URL** | https://headshots-starter-clone-ashy-zeta.vercel.app |

**Description:**

```
AI headshot generator — upload selfies, receive professional portraits in minutes. Built with Next.js, Supabase, and AI pipelines; shows shipping AI features to production, not tutorial demos.
```

---

## 3. Brewra

| Field | Value |
|-------|-------|
| **Project name** | Brewra |
| **Project URL** | https://coffeebrewra.vercel.app/en |

**Description:**

```
Cross-platform coffee brewing guide (React Native + Next.js). Building in public toward first mobile app and SaaS launch — product-led side project with bilingual UX and live web preview.
```

---

## 4. cog-jackpot

| Field | Value |
|-------|-------|
| **Project name** | cog-jackpot |
| **Project URL** | https://bolao-cog.vercel.app/login |

**Description:**

```
Internal team pool application built with Next.js, TypeScript, and Vercel. 30+ active users at Cognyte — real shipped product used weekly, not a hackathon throwaway.
```

---

## 5. Igor Melo — Portfolio

| Field | Value |
|-------|-------|
| **Project name** | Igor Melo — Portfolio |
| **Project URL** | https://igorjm.github.io |

**Description:**

```
Bilingual developer portfolio (EN/PT-BR). Next.js 15, TypeScript, Tailwind, static export to GitHub Pages — intentional craft, performance, and accessibility.
```

---

## Remove / replace old entry

Delete the existing project titled `https://igorjm.github.io/` with description "My Personal Presentation Card." Replace with entry **#5** above.

---

## LinkedIn Featured (link cards)

Add in this order (separate from Projects):

1. https://igorjm.github.io
2. https://nextjs-meal-plan-saas.vercel.app
3. https://headshots-starter-clone-ashy-zeta.vercel.app
4. https://igorjm.github.io/resume/igor_melo_frontend_engineer.pdf

---

## GitHub pin order

Pin these repos (top to bottom):

1. https://github.com/igorjm/nextjs-meal-plan-saas
2. https://github.com/igorjm/headshots-starter-clone
3. https://github.com/igorjm/brewra
4. https://github.com/igorjm/igorjm.github.io
5. https://github.com/igorjm/cog-jackpot

Unpin or deprioritize: crypto tracker, old tutorials, gemidao-do-zap.

### README template (per pinned repo)

```markdown
# [Project Name]

[One-line problem / value prop]

**Stack:** [technologies]
**Live:** [url]

## What it does
[2-3 sentences]

## Highlights
- [Outcome or feature 1]
- [Outcome or feature 2]
```

---

## Phase 0 checklist

- [ ] LinkedIn Projects: 5 entries added (order above)
- [ ] Old URL-only project removed
- [ ] Featured: 4 links added
- [ ] GitHub: 5 repos pinned in order
- [ ] GitHub: README updated on pinned repos
- [ ] Skills pinned: Java, React.js, TypeScript, Spring Boot, PostgreSQL
- [ ] Export PDF → `exports/linkedin-profile.pdf`
- [ ] Run `npm run career:import-linkedin` and `npm run career:audit-linkedin -- --no-fetch` (from `web/`)
