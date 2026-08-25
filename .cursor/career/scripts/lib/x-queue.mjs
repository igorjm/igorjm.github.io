import { readJson, writeJson } from "./fs-json.mjs";
import { POST_QUEUE_FILE } from "./x-paths.mjs";

/** Today's post queue, or `null` when the morning brief has not run. */
export function loadPostQueue() {
  return readJson(POST_QUEUE_FILE);
}

export function savePostQueue(queue) {
  writeJson(POST_QUEUE_FILE, queue);
}
