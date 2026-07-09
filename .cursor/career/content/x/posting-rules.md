# X Posting Rules — Igor Melo

Automation guardrails for the morning pipeline and `x-post-queue.mjs`.

## Volume

| Phase | Posts/day | Slots (BRT) |
|-------|-----------|-------------|
| Week 1 (dry run) | 0 (draft only) | — |
| Week 2 | 2 | 08:00, 17:00 |
| Week 3+ | 3–4 | 08:00, 12:00, 17:00, 20:00 |

Default `X_MAX_POSTS_PER_DAY=4`.

## Language

- **Default:** English
- **PT-BR:** 1 post on Mondays (config: `X_PT_BR_WEEKDAY=1` = Monday)
- Never auto-translate EN posts to PT in the same slot

## Safety

- Max **280 characters** per tweet (except pure retweets — no text)
- Max **1 URL** per day across all posts
- Max **2 quote-tweets** per day (`X_MAX_QUOTE_TAKES_PER_DAY`)
- Max **1 pure retweet** per day (`X_MAX_RETWEETS_PER_DAY`)
- Blocked keywords: `giveaway`, `crypto moon`, `guaranteed returns`, `DM for`
- No posts about Cognyte confidential products or internals
- `X_AUTO_POST=true` required to publish (default `false`)
- `X_DRY_RUN=true` writes briefing only, no queue publish

## Content mix (daily target)

- 1–2× AI/tech trend commentary (original)
- 1–2× quote-tweet with take (retweet with comment)
- 0–1× pure retweet (amplify high-engagement watchlist post)
- 0–1× own project mention (rotate MealPlan, Brewra, portfolio)

## Monetization alignment

- Original text only — inspiration URLs logged, never copied
- Reply to comments on **your** posts manually (v1 — no auto-replies to strangers)
- Pin tweet: portfolio + best AI project (update in [x-baseline.md](../../exports/x-baseline.md))

## Kill switch

Set `X_AUTO_POST=false` or disable GitHub Action workflow to stop all publishing.

## Images (automated)

- **Never** copy or remix images from watchlist / inspiration posts
- Max **1 image post per day** (`X_IMAGE_POSTS_PER_DAY=1`)
- Strategies:
  - `quote_card` — branded PNG rendered from tweet text (default)
  - `project_screenshot` — Playwright capture of your own project URL (`X_SCREENSHOT_ENABLED=true`)
- Requires `X_MEDIA_ENABLED=true` and OAuth scope `media.write` (re-run `npm run career:x:setup`)
- Quote-tweet slots stay text-only (quote card is redundant)
- Cached assets: `.cursor/career/.cache/x/media/` (gitignored)
- Media deps: `cd .cursor/career/scripts && npm install` (sharp, playwright)
