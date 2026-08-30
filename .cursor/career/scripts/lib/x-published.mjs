import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { readJson, readJsonSafe, writeJson } from "./fs-json.mjs";
import { X_PUBLISHED_DIR } from "./x-paths.mjs";

/** Published log files (`YYYY-MM-DD.json`), sorted oldest to newest. */
function listPublishedFiles() {
  if (!existsSync(X_PUBLISHED_DIR)) return [];
  return readdirSync(X_PUBLISHED_DIR)
    .filter((f) => f.endsWith(".json"))
    .sort();
}

function publishedLogPath(dateStr) {
  return join(X_PUBLISHED_DIR, `${dateStr}.json`);
}

/** Published logs as `{ date, posts }`, skipping unreadable files. */
function readPublishedLogs({ lastDays } = {}) {
  const files = listPublishedFiles();
  const selected = lastDays ? files.slice(-lastDays) : files;

  return selected.flatMap((file) => {
    const data = readJsonSafe(join(X_PUBLISHED_DIR, file));
    if (!data) return [];
    return [{ date: data.date ?? file.replace(".json", ""), posts: data.posts ?? [] }];
  });
}

/** Map of date string to the posts published on that date. */
export function loadPublishedByDate() {
  return new Map(readPublishedLogs().map((log) => [log.date, log.posts]));
}

/** Texts of recently published posts, used for de-duplicating new drafts. */
export function loadRecentPublishedTexts(lastDays = 7) {
  return readPublishedLogs({ lastDays })
    .flatMap((log) => log.posts)
    .map((post) => post.text)
    .filter(Boolean);
}

/** Append one published post to that date's log. */
export function appendPublishedLog(dateStr, entry) {
  const path = publishedLogPath(dateStr);
  const log = readJson(path, { date: dateStr, posts: [] });
  log.posts.push(entry);
  writeJson(path, log);
}
