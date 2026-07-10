# X Content — Igor Melo

Automated morning curation + full-auto posting pipeline for @igoorjm.

| File | Purpose |
|------|---------|
| [phase0-setup.md](phase0-setup.md) | One-time X Premium, Developer app, OAuth, secrets |
| [watchlist.md](watchlist.md) | Accounts and topics to track |
| [voice-x.md](voice-x.md) | X tone (EN-first, punchy) |
| [posting-rules.md](posting-rules.md) | Volume, safety, kill switch |
| [metrics.md](metrics.md) | Weekly tracking |
| [revenue-sharing.md](revenue-sharing.md) | **North star:** Creator Revenue Sharing eligibility |
| [rollout.md](rollout.md) | 4-week enablement checklist |
| `daily/` | Generated morning briefings |
| `published/` | Posted tweet log (JSON) |

## Quick start

```bash
# 1. Complete phase0-setup.md
# 2. Dry run
cd web
X_DRY_RUN=true npm run career:x:brief

# 3. Review .cursor/career/content/x/daily/YYYY-MM-DD-briefing.md
# 4. Enable auto-post (week 2+)
X_AUTO_POST=true npm run career:x:pipeline
```

## Invoke in Cursor

```
@x-specialist Research today's AI trends and draft 3 tweets
```

## Scripts (from `web/`)

| Command | Action |
|---------|--------|
| `npm run career:x:setup` | One-time OAuth |
| `npm run career:x:brief` | Morning briefing + queue (respects DRY_RUN) |
| `npm run career:x:post` | Post next scheduled slot |
| `npm run career:x:pipeline` | Brief + post first slot |
| `npm run career:x:notion-sync` | Push queue to Notion hub |

## Env vars

See [phase0-setup.md](phase0-setup.md). Key flags: `X_DRY_RUN`, `X_AUTO_POST`, `X_MAX_POSTS_PER_DAY`, `X_MEDIA_ENABLED`, `X_IMAGE_POSTS_PER_DAY`, `X_SCREENSHOT_ENABLED`, `NOTION_TOKEN`, `NOTION_DATABASE_ID`.

Notion setup: [../notion-hub.md](../notion-hub.md)
