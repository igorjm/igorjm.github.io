import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";

/** Read a JSON file, returning `fallback` when it does not exist. */
export function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Read a JSON file, returning `fallback` when it is missing or unparseable. */
export function readJsonSafe(path, fallback = null) {
  try {
    return readJson(path, fallback);
  } catch {
    return fallback;
  }
}

/** Write pretty-printed JSON, creating the parent directory when needed. */
export function writeJson(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}
