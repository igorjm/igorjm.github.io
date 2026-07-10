# Career Content — Igor Melo

Ready-to-publish posts and automation for LinkedIn + X.

## LinkedIn

| File | Purpose |
|------|---------|
| [linkedin-posts.md](linkedin-posts.md) | 8 posts — copy/paste into LinkedIn |
| [linkedin-projects.md](linkedin-projects.md) | Projects + Featured + GitHub pin setup |
| [posting-calendar.md](posting-calendar.md) | 8-week schedule, checkboxes, metrics |

## X (Twitter)

| File | Purpose |
|------|---------|
| [x/README.md](x/README.md) | Morning bot quick start |
| [x/phase0-setup.md](x/phase0-setup.md) | OAuth, Premium, secrets |
| [x/rollout.md](x/rollout.md) | 4-week dry-run → auto-post |
| [notion-hub.md](notion-hub.md) | Notion database sync (X + LinkedIn + media) |

```bash
cd web && X_DRY_RUN=true npm run career:x:brief
```

## Quick start

1. Complete Phase 0 in [linkedin-projects.md](linkedin-projects.md)
2. Open [posting-calendar.md](posting-calendar.md) — set start date
3. Publish Post 1 from [linkedin-posts.md](linkedin-posts.md)
4. One post every 7–10 days; track status in calendar

## Invoke for tweaks

```
@linkedin-specialist Polish Post 2 for cog-jackpot before I publish
```

## After Phase 0

```bash
cd web
npm run career:import-linkedin
npm run career:audit-linkedin -- --no-fetch
```
