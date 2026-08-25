#!/usr/bin/env node
/**
 * Diagnose Notion connection — database ID vs page ID, integration access.
 *
 * Usage (from web/):
 *   npm run career:x:notion-diagnose
 */

import "./lib/load-web-env.mjs";
import { diagnoseNotionConnection } from "./lib/x-notion.mjs";
import { fatal } from "./lib/errors.mjs";

async function main() {
  const id = process.env.NOTION_DATABASE_ID?.trim();
  const token = process.env.NOTION_TOKEN?.trim();

  if (!token || !id) {
    console.error("Set NOTION_TOKEN and NOTION_DATABASE_ID in web/.env.x");
    process.exit(1);
  }

  console.log(`Checking Notion ID: ${id}\n`);
  const result = await diagnoseNotionConnection(id);

  if (result.databaseOk) {
    console.log(`OK — database "${result.databaseTitle}" is accessible.`);
    if (result.missing?.length) {
      console.log(`\nMissing columns (optional but recommended):`);
      for (const name of result.missing) console.log(`  - ${name}`);
      console.log("\nSee .cursor/career/content/notion-hub.md for types.");
    } else {
      console.log("All expected columns present.");
    }
    console.log("\nRun: npm run career:x:notion-sync");
    return;
  }

  console.log("Database API: NOT accessible\n");

  if (result.pageOk) {
    console.log(
      `This ID is a PAGE ("${result.pageTitle}"), not a database.`,
    );
    if (result.childDatabases?.length) {
      console.log("\nChild databases found on this page:");
      for (const db of result.childDatabases) {
        console.log(`  → ${db.title}: ${db.id}`);
        console.log(`    Use: NOTION_DATABASE_ID=${db.id}`);
      }
    } else {
      console.log(
        "\nNo inline database found. Create a full-page database or copy link from the table block.",
      );
    }
  } else if (result.accessDenied) {
    console.log("Integration cannot see this page/database.");
    console.log("\nFix:");
    console.log('  1. Open the page in Notion');
    console.log('  2. ⋯ (top right) → Connections');
    console.log('  3. Enable "igorjm.github.io" (your integration)');
    console.log("  4. Re-run: npm run career:x:notion-diagnose");
  } else {
    console.log(result.error ?? "Unknown error");
  }

  process.exit(1);
}

main().catch(fatal);
