# Igor Melo — Portfolio

[![Live site](https://img.shields.io/badge/live-igorjm.github.io-0ea5e9?style=flat-square)](https://igorjm.github.io)
[![Deploy](https://github.com/igorjm/igorjm.github.io/actions/workflows/nextjs.yml/badge.svg)](https://github.com/igorjm/igorjm.github.io/actions/workflows/nextjs.yml)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

Bilingual personal portfolio for **Igor Melo**, Senior Software Engineer at Cognyte — built with Next.js, TypeScript, and a focus on performance, accessibility, and clean architecture.

**Live:** [igorjm.github.io](https://igorjm.github.io) · **Resume:** [PDF](https://igorjm.github.io/resume/igor_melo_frontend_engineer.pdf) · **LinkedIn:** [igorjm](https://www.linkedin.com/in/igorjm)

## Highlights

- **Bilingual** — English and Brazilian Portuguese (`next-intl`)
- **Static export** — fast, CDN-friendly deploy to GitHub Pages
- **Design system** — custom theme tokens, dark/light mode, scroll-driven animations
- **Project showcase** — live previews via Microlink with graceful fallbacks
- **CI/CD** — automated build and deploy on every push to `master`

## Tech stack

| Layer | Tools |
|-------|-------|
| Framework | Next.js 15 (App Router), React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| i18n | next-intl |
| Motion | Framer Motion |
| Deploy | GitHub Actions → GitHub Pages |

## Project structure

```
.
├── .github/workflows/     # CI/CD (GitHub Pages deploy)
└── web/                   # Next.js application
    ├── app/               # Routes, layouts, global styles
    ├── components/
    │   ├── layout/        # App shell (providers, scroll effects)
    │   ├── sections/      # Page sections (hero, about, projects…)
    │   └── ui/            # Reusable UI primitives
    ├── hooks/             # Client-side hooks
    ├── i18n/              # Locale routing & navigation
    ├── lib/
    │   ├── constants/     # Asset paths, social links
    │   ├── data/          # Portfolio content (profile, projects…)
    │   ├── types/         # Shared TypeScript types
    │   ├── preview.ts     # Live project preview URLs
    │   ├── theme.ts       # Design tokens
    │   └── utils.ts       # Utilities
    ├── messages/          # i18n copy (en, pt-BR)
    └── public/
        ├── images/        # Logo, profile photo
        ├── resume/        # CV / resume PDF
        └── projects/      # Optional manual project screenshots
```

## Getting started

```bash
git clone https://github.com/igorjm/igorjm.github.io.git
cd igorjm.github.io/web
npm install
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en) (or `/pt-BR` for Portuguese).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (Turbopack) |
| `npm run build` | Production static export |
| `npm run start` | Serve production build |
| `npm run lint` | Run ESLint |

## Content updates

| What | Where |
|------|-------|
| Copy (EN / PT) | `web/messages/en.json`, `pt-BR.json` |
| Profile & resume | `web/lib/data/profile.ts`, `public/resume/` |
| Experience | `web/messages/*.json` + `lib/data/experience.ts` |
| Projects | `web/lib/data/projects.ts` |
| Tech stack | `web/lib/data/skills.ts` |
| Project screenshots | `web/public/projects/{id}.png` (optional override) |

## Deployment

Pushes to `master` trigger the [GitHub Actions workflow](.github/workflows/nextjs.yml) that builds `web/` and deploys the static export to GitHub Pages.

## Author

**Igor Melo** — Senior Software Engineer · Florianópolis, Brazil

[![GitHub](https://img.shields.io/badge/GitHub-igorjm-181717?style=flat-square&logo=github)](https://github.com/igorjm)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-igorjm-0a66c2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/igorjm)
[![Email](https://img.shields.io/badge/Email-igorjmelo4@gmail.com-ea4335?style=flat-square&logo=gmail&logoColor=white)](mailto:igorjmelo4@gmail.com)
