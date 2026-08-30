#!/usr/bin/env node
/**
 * Morning pipeline: fetch trends + watchlist, curate tweets, write briefing + queue.
 *
 * Usage (from web/):
 *   npm run career:x:brief
 *
 * Env: web/.env.x (auto-loaded), X_DRY_RUN, X_MAX_POSTS_PER_DAY, X_WOEID, LLM API key
 */

import "./lib/load-web-env.mjs";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";
import {
  X_CACHE_DIR,
  X_DAILY_DIR,
  X_PUBLISHED_DIR,
  POST_QUEUE_FILE,
  DEFAULT_WOEID,
  todayDateStr,
  envFlag,
  envInt,
} from "./lib/x-paths.mjs";
import {
  fetchTrendSignals,
  fetchWatchlistSignal,
} from "./lib/x-client.mjs";
import { parseWatchlistHandles } from "./lib/x-watchlist.mjs";
import { curateTweets, formatBriefingMarkdown } from "./lib/x-curate.mjs";
import { filterTweetBatch } from "./lib/x-safety.mjs";
import { fatal, readJsonFile } from "./lib/errors.mjs";

function loadRecentPublishedTexts() {
  if (!existsSync(X_PUBLISHED_DIR)) return [];

  const files = readdirSync(X_PUBLISHED_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort()
    .slice(-7);

  const texts = [];
  for (const file of files) {
    try {
      const data = readJsonFile(join(X_PUBLISHED_DIR, file));
      for (const p of data.posts ?? []) {
        if (p.text) texts.push(p.text);
      }
    } catch (err) {
      // Deduplication is best-effort, but a broken log must be visible.
      console.warn(`Skipping published log ${file}: ${err.message}`);
    }
  }
  return texts;
}

async function main() {
  const dateStr = todayDateStr();
  const dryRun = envFlag("X_DRY_RUN", true);
  const maxPosts = envInt("X_MAX_POSTS_PER_DAY", 4);
  const woeid = process.env.X_WOEID ?? DEFAULT_WOEID;

  mkdirSync(X_CACHE_DIR, { recursive: true });
  mkdirSync(X_DAILY_DIR, { recursive: true });

  console.log(`X morning pipeline — ${dateStr} (dryRun=${dryRun})`);

  let trends = [];
  let watchlistSignals = [];

  try {
    trends = await fetchTrendSignals(woeid);
    console.log(`Trends/signals: ${trends.length}`);
  } catch (err) {
    console.warn("Trend fetch failed:", err.message);
    if (String(err.message).includes("401")) {
      console.warn(
        "Hint: after enabling X API billing, re-run: npm run career:x:setup",
      );
    }
    trends = [{ note: "API unavailable — using LLM/fallback only" }];
  }

  try {
    const handles = parseWatchlistHandles();
    watchlistSignals = await fetchWatchlistSignal(handles);
    console.log(`Watchlist signals: ${watchlistSignals.filter((s) => s.text).length}`);
  } catch (err) {
    console.warn("Watchlist fetch failed:", err.message);
    watchlistSignals = [];
  }

  let tweets = await curateTweets({
    trends,
    watchlistSignals,
    dateStr,
    maxPosts,
  });

  const publishedTexts = loadRecentPublishedTexts();
  tweets = filterTweetBatch(tweets, { publishedTexts });

  const briefing = formatBriefingMarkdown({
    dateStr,
    trends,
    watchlistSignals,
    tweets,
    dryRun,
  });

  const briefingPath = join(X_DAILY_DIR, `${dateStr}-briefing.md`);
  writeFileSync(briefingPath, briefing);

  const queue = {
    date: dateStr,
    createdAt: new Date().toISOString(),
    dryRun,
    tweets,
  };
  writeFileSync(POST_QUEUE_FILE, JSON.stringify(queue, null, 2));

  console.log(`Wrote briefing: ${briefingPath}`);
  console.log(`Wrote queue: ${POST_QUEUE_FILE} (${tweets.length} tweets)`);

  if (dryRun) {
    console.log("\nDRY RUN — review briefing before setting X_DRY_RUN=false");
  }
}

main().catch(fatal);
