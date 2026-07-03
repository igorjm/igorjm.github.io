# igorjm.github.io

Personal portfolio for [Igor Melo](https://igorjm.github.io) — Senior Software Engineer.

## Stack

- **Next.js 15** (App Router, static export)
- **TypeScript**
- **Tailwind CSS 4**
- **next-intl** (EN + pt-BR)
- **Framer Motion**
- Deployed via **GitHub Pages**

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
        ├── images/        # Logo & static images
        ├── resume/        # CV / resume PDF
        └── projects/      # Optional manual project screenshots
```

## Development

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en).

## Scripts

| Command        | Description              |
|----------------|--------------------------|
| `npm run dev`  | Start dev server         |
| `npm run build`| Production static build  |
| `npm run start`| Serve production build   |
| `npm run lint` | Run ESLint               |

## Content updates

| What              | Where                                      |
|-------------------|--------------------------------------------|
| Copy (EN / PT)    | `web/messages/en.json`, `pt-BR.json`       |
| Profile & resume  | `web/lib/data/profile.ts`, `public/resume/`  |
| Experience        | `web/messages/*.json` + `lib/data/experience.ts` |
| Projects          | `web/lib/data/projects.ts`                 |
| Tech stack        | `web/lib/data/skills.ts`                   |
| Project screenshots | `web/public/projects/{id}.png` (optional) |

## Deploy

Pushes to `master` trigger the GitHub Actions workflow that builds `web/` and deploys to GitHub Pages.
