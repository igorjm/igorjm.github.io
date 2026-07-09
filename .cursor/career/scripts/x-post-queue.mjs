#!/usr/bin/env node
/**
 * Post due tweets from the morning queue.
 *
 * Usage (from web/):
 *   npm run career:x:post
 *
 * Env: web/.env.x (auto-loaded), X_AUTO_POST, X_DRY_RUN, X_MEDIA_ENABLED
 */

import "./lib/load-web-env.mjs";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  POST_QUEUE_FILE,
  X_PUBLISHED_DIR,
  todayDateStr,
  envFlag,
} from "./lib/x-paths.mjs";
import { createTweet, createRetweet } from "./lib/x-client.mjs";
import { getDuePosts } from "./lib/x-schedule.mjs";
import { preparePostMedia } from "./lib/x-media.mjs";

function loadQueue() {
  if (!existsSync(POST_QUEUE_FILE)) {
    throw new Error("No queue found. Run: npm run career:x:brief");
  }
  return JSON.parse(readFileSync(POST_QUEUE_FILE, "utf8"));
}

function saveQueue(queue) {
  writeFileSync(POST_QUEUE_FILE, JSON.stringify(queue, null, 2));
}

function appendPublishedLog(dateStr, entry) {
  mkdirSync(X_PUBLISHED_DIR, { recursive: true });
  const path = join(X_PUBLISHED_DIR, `${dateStr}.json`);
  let log = { date: dateStr, posts: [] };
  if (existsSync(path)) {
    log = JSON.parse(readFileSync(path, "utf8"));
  }
  log.posts.push(entry);
  writeFileSync(path, JSON.stringify(log, null, 2));
}

async function main() {
  const dryRun = envFlag("X_DRY_RUN", true);
  const autoPost = envFlag("X_AUTO_POST", false);
  const mediaEnabled = envFlag("X_MEDIA_ENABLED", false);
  const dateStr = todayDateStr();

  const queue = loadQueue();
  const due = getDuePosts(queue.tweets);

  if (due.length === 0) {
    console.log("No due posts in queue.");
    return;
  }

  console.log(
    `Due posts: ${due.length} (dryRun=${dryRun}, autoPost=${autoPost}, media=${mediaEnabled})`,
  );

  for (const item of due) {
    const idx = queue.tweets.findIndex(
      (t) => t.scheduledAt === item.scheduledAt && t.text === item.text,
    );

    const typeNote = item.type === "retweet" ? " [retweet]" : "";
    const imageNote =
      item.imageStrategy && item.imageStrategy !== "none"
        ? ` [${item.imageStrategy}]`
        : "";

    if (dryRun || !autoPost) {
      console.log(`[SKIP] Would post at ${item.scheduledAt}${typeNote}${imageNote}:`);
      if (item.type === "retweet") {
        console.log(`  RT https://x.com/i/web/status/${item.retweetTweetId}`);
      } else {
        console.log(item.text);
      }
      continue;
    }

    try {
      let tweetId;
      let mediaIds;
      let mediaPath;
      let mediaId;

      if (item.type === "retweet") {
        await createRetweet(item.retweetTweetId);
        tweetId = item.retweetTweetId;
      } else {
        if (mediaEnabled && item.imageStrategy && item.imageStrategy !== "none") {
          const media = await preparePostMedia(item);
          mediaId = media.mediaId;
          mediaPath = media.mediaPath;
          if (mediaId) {
            mediaIds = [mediaId];
          }
        }

        const res = await createTweet({
          text: item.text,
          quoteTweetId: item.quoteTweetId ?? undefined,
          mediaIds,
        });

        tweetId = res?.data?.id;
      }
      queue.tweets[idx].posted = true;
      queue.tweets[idx].tweetId = tweetId;
      queue.tweets[idx].postedAt = new Date().toISOString();
      if (mediaId) {
        queue.tweets[idx].mediaId = mediaId;
        queue.tweets[idx].mediaPath = mediaPath;
      }

      appendPublishedLog(dateStr, {
        tweetId,
        text: item.text || null,
        type: item.type,
        language: item.language,
        quoteTweetId: item.quoteTweetId ?? null,
        retweetTweetId: item.retweetTweetId ?? null,
        sourceInspiration: item.sourceInspiration,
        imageStrategy: item.imageStrategy ?? null,
        mediaId: mediaId ?? null,
        postedAt: queue.tweets[idx].postedAt,
      });

      if (item.type === "retweet") {
        console.log(`Retweeted: https://x.com/i/web/status/${item.retweetTweetId}`);
      } else {
        console.log(`Posted: https://x.com/i/web/status/${tweetId}`);
      }
    } catch (err) {
      console.error(`Failed to post: ${err.message}`);
      queue.tweets[idx].error = err.message;
    }
  }

  saveQueue(queue);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
