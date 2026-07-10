#!/usr/bin/env node
/**
 * Sync career content queue to Notion database.
 *
 * Usage (from web/):
 *   npm run career:x:notion-sync
 *   npm run career:x:notion-sync -- --published
 *
 * Env: NOTION_TOKEN, NOTION_DATABASE_ID, NOTION_ENABLED
 */

import "./lib/load-web-env.mjs";
import { todayDateStr } from "./lib/x-paths.mjs";
import { collectNotionRows, listAvailableMedia } from "./lib/notion-content.mjs";
import { isNotionEnabled, upsertPages } from "./lib/x-notion.mjs";

async function main() {
  const publishedOnly = process.argv.includes("--published");
  const dateStr = todayDateStr();

  if (!isNotionEnabled()) {
    console.log(
      "Notion sync skipped (set NOTION_TOKEN + NOTION_DATABASE_ID in web/.env.x or GitHub Secrets)",
    );
    return;
  }

  const rows = collectNotionRows({ dateStr, publishedOnly });
  if (rows.length === 0) {
    console.log("No rows to sync.");
    if (!publishedOnly) {
      console.log(
        "Hint: run npm run career:x:brief first to generate post-queue.json",
      );
    }
    return;
  }

  const { files } = listAvailableMedia();
  console.log(
    `Notion sync — ${dateStr} (${rows.length} rows, publishedOnly=${publishedOnly})`,
  );
  if (files.length) {
    console.log(`Media files: ${files.join(", ")}`);
  }

  const result = await upsertPages(rows);
  console.log(
    `Notion: ${result.created} created, ${result.updated} updated (${result.total} total)`,
  );
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
