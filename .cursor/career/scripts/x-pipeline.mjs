#!/usr/bin/env node
/**
 * Run morning brief then post first due slot.
 *
 * Usage (from web/):
 *   npm run career:x:pipeline
 */

import { spawn } from "child_process";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function run(script) {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [join(__dirname, script)], {
      stdio: "inherit",
      env: process.env,
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${script} exited ${code}`));
    });
  });
}

async function main() {
  await run("x-morning-pipeline.mjs");
  await run("x-post-queue.mjs");
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
