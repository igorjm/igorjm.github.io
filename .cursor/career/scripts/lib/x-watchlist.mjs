import { readFileSync } from "fs";
import { WATCHLIST_MD } from "./x-paths.mjs";

export function parseWatchlistHandles() {
  const md = readFileSync(WATCHLIST_MD, "utf8");
  const handles = new Set();
  const re = /@([A-Za-z0-9_]+)/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    handles.add(`@${m[1]}`);
  }
  return [...handles];
}

export function parseHashtagQueries() {
  const md = readFileSync(WATCHLIST_MD, "utf8");
  const tags = [];
  const re = /#([A-Za-z0-9_]+)/g;
  let m;
  while ((m = re.exec(md)) !== null) {
    tags.push(`#${m[1]}`);
  }
  return tags;
}
