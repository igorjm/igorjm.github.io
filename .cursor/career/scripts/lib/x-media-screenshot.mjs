import { createHash } from "crypto";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { X_MEDIA_CACHE_DIR } from "./x-paths.mjs";
import { requireWebDevDep } from "./x-deps.mjs";

const VIEWPORT = { width: 1200, height: 630 };

function cachePathFor(url, key) {
  const hash = createHash("sha256").update(url).digest("hex").slice(0, 16);
  return join(X_MEDIA_CACHE_DIR, `screenshot-${key ?? "project"}-${hash}.png`);
}

function loadPlaywright() {
  return requireWebDevDep("playwright");
}

export async function captureProjectScreenshot(url, key = "project") {
  mkdirSync(X_MEDIA_CACHE_DIR, { recursive: true });
  const outPath = cachePathFor(url, key);
  if (existsSync(outPath)) {
    return outPath;
  }

  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: VIEWPORT });
    await page.goto(url, { waitUntil: "networkidle", timeout: 45_000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: outPath, type: "png", fullPage: false });
  } finally {
    await browser.close();
  }

  return outPath;
}
