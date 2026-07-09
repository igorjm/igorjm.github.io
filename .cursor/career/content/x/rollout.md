# X Rollout — 4 Weeks

Track progress. Do not skip week 1 dry run.

## Week 0 — Setup

- [ ] X Premium + verified @igoorjm
- [ ] Developer app + OAuth (`npm run career:x:setup`)
- [ ] GitHub Secrets configured
- [ ] MCP in Cursor (`.cursor/mcp.json`)
- [ ] Bio + pinned tweet per [x-baseline.md](../../exports/x-baseline.md)

## Week 1 — Dry run

- [ ] `X_DRY_RUN=true` on all runs
- [ ] GitHub Action runs daily (briefing only)
- [ ] Review 7 daily briefings in `daily/`
- [ ] Tune [watchlist.md](watchlist.md) and [voice-x.md](voice-x.md) if tone is off

## Week 2 — Limited auto-post

- [ ] `X_DRY_RUN=false`, `X_AUTO_POST=true`
- [ ] `X_MAX_POSTS_PER_DAY=2`
- [ ] Monitor `published/` logs daily
- [ ] Reply to comments manually

## Week 3 — Full volume

- [ ] `X_MAX_POSTS_PER_DAY=4`
- [ ] First PT-BR post (Monday slot)
- [ ] First weekly thread (Brewra or cog-jackpot)
- [ ] Update [metrics.md](metrics.md)

## Week 4 — Optimize

- [ ] Review impressions in X analytics vs **Verified Home Timeline** (monetization dashboard)
- [ ] Update [metrics.md](metrics.md) + [revenue-sharing.md](revenue-sharing.md)
- [ ] Adjust watchlist based on engagement
- [ ] Cross-link best X thread on LinkedIn (optional)
- [ ] Apply at [x.com/settings/monetization](https://x.com/settings/monetization) when eligible

## Kill switch

Disable workflow `.github/workflows/x-morning-bot.yml` or set repo secret `X_AUTO_POST=false`.
