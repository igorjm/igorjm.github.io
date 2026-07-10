# Notion Content Hub

Single Notion database for X daily queue, LinkedIn pipeline, and media references.

## One-time setup

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) → **New integration** → copy **Internal Integration Secret**
2. In Notion, create page **Career Content Ops**
3. Add a **database** (table) named **Content Queue** with these properties (names must match exactly):

| Property | Type | Select options (if applicable) |
|----------|------|--------------------------------|
| Name | Title | — |
| Date | Date | — |
| Platform | Select | `X`, `LinkedIn` |
| Slot | Text | — |
| Type | Select | `original`, `quote_take`, `retweet`, `project`, `linkedin_post` |
| Status | Select | `draft`, `scheduled`, `posted`, `skipped` |
| Text | Text | — |
| Language | Select | `en`, `pt-BR`, `bilingual` |
| Inspiration | URL | — |
| Reference | URL | — |
| Media | Text | — |
| ImageStrategy | Select | `none`, `quote_card`, `screenshot`, `static_asset` |
| PublishedURL | URL | — |
| ExternalID | Text | — |
| BriefingURL | URL | — |

4. Share the page with your integration (⋯ → **Connections** → enable `igorjm.github.io`)
5. Copy database ID from URL: `app.notion.com/p/{DATABASE_ID}?v=...` (the `v=` part is only the view — ignore it)
6. Add to `web/.env.x` and GitHub Secrets:

```
NOTION_TOKEN=secret_...
NOTION_DATABASE_ID=...
NOTION_ENABLED=true
```

## Sync commands

From `web/`:

```bash
npm run career:x:brief              # generate queue first
npm run career:x:notion-sync          # upsert X + LinkedIn rows
npm run career:x:notion-sync -- --published   # refresh X posted status after post
```

GitHub Action runs sync automatically after brief/post when `NOTION_TOKEN` secret is set.

## What gets synced

| Source | Rows |
|--------|------|
| `post-queue.json` | Today's X tweets (text, slot, type, inspiration, image strategy) |
| `content/x/published/*.json` | Posted URL + status |
| `content/linkedin-posts.md` | All 8 LinkedIn posts |
| `content/posting-calendar.md` | LinkedIn draft/posted status |
| `content/media/index.json` | Media filenames linked to posts |

## Recommended Notion views

- **Today** — `Date` is today
- **X queue** — `Platform` = X, sort by Slot
- **LinkedIn pipeline** — `Platform` = LinkedIn, group by Status
- **Needs media** — `Platform` = LinkedIn AND `Media` is empty

## Media files

Put images in [media/](media/). Map them in [media/index.json](media/index.json):

```json
{
  "metrics-jackpot-30-days.png": {
    "projects": ["cog-jackpot"],
    "linkedin_posts": [2],
    "description": "30-day metrics screenshot"
  }
}
```

v1 references filenames in the `Media` column — files are not uploaded to Notion.

## Troubleshooting

If sync fails with `object_not_found` / 404, the ID is usually correct — the integration just cannot see the page yet.

```bash
npm run career:x:notion-diagnose
```

| Diagnose result | Fix |
|-----------------|-----|
| Integration cannot see this page | Open the page → ⋯ → **Connections** → enable your integration |
| This ID is a PAGE, not a database | Use the child database ID printed by diagnose, or open the table as full page and copy that link |
| OK — database accessible | Run `npm run career:x:notion-sync` |

Notion returns 404 (not 403) when an integration lacks access — so a wrong ID and missing connection look the same until you run diagnose.

## Limitations (v1)

- Repo is source of truth; Notion is a read-friendly dashboard (no two-way sync)
- `post-queue.json` is gitignored — sync runs on the machine/CI that generated the queue
- Images are path references only, not Notion file uploads
