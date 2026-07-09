import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { REPO_ROOT } from "./x-paths.mjs";

const ENV_FILES = [
  join(REPO_ROOT, "web/.env.x"),
  join(REPO_ROOT, "web/.env.local"),
];

function parseEnvLine(line) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) return null;

  const eq = trimmed.indexOf("=");
  if (eq <= 0) return null;

  const key = trimmed.slice(0, eq).trim();
  let value = trimmed.slice(eq + 1).trim();

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1);
  }

  return { key, value };
}

export function loadWebEnv() {
  for (const file of ENV_FILES) {
    if (!existsSync(file)) continue;

    for (const line of readFileSync(file, "utf8").split("\n")) {
      const parsed = parseEnvLine(line);
      if (!parsed) continue;
      if (process.env[parsed.key] !== undefined) continue;
      process.env[parsed.key] = parsed.value;
    }
  }
}

// Load on import so entry scripts only need: import "./lib/load-web-env.mjs";
loadWebEnv();
