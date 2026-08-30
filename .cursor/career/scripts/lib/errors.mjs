import { readFileSync } from "fs";

/**
 * Entry-point error handler. Prints the full error (stack plus any `cause`
 * chain) so unattended runs in CI keep the diagnostics, then exits non-zero.
 */
export function fatal(err) {
  console.error(err instanceof Error ? err.stack || err.message : err);
  let cause = err?.cause;
  while (cause) {
    console.error("caused by:", cause instanceof Error ? cause.stack : cause);
    cause = cause?.cause;
  }
  process.exit(1);
}

/** Reads and parses JSON, reporting which file failed to parse. */
export function readJsonFile(path) {
  const raw = readFileSync(path, "utf8");
  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Invalid JSON in ${path}: ${err.message}`, { cause: err });
  }
}

/** Parses a JSON response body, keeping the raw text in the error message. */
export function parseJsonBody(text, context) {
  try {
    return text ? JSON.parse(text) : {};
  } catch (err) {
    throw new Error(
      `${context}: response was not JSON: ${text.slice(0, 200)}`,
      { cause: err },
    );
  }
}
