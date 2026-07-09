import { createHash } from "crypto";
import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import { X_MEDIA_CACHE_DIR } from "./x-paths.mjs";
import { requireWebDevDep } from "./x-deps.mjs";

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 675;
const MAX_LINES = 5;
const CHARS_PER_LINE = 44;

function escapeXml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripUrls(text) {
  return text.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
}

function wrapText(text) {
  const words = stripUrls(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > CHARS_PER_LINE && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
    if (lines.length >= MAX_LINES) break;
  }

  if (line && lines.length < MAX_LINES) {
    lines.push(line);
  } else if (lines.length === MAX_LINES && line) {
    const last = lines[MAX_LINES - 1];
    lines[MAX_LINES - 1] =
      last.length > CHARS_PER_LINE - 1
        ? `${last.slice(0, CHARS_PER_LINE - 1)}…`
        : last;
  }

  return lines.length ? lines : [stripUrls(text).slice(0, CHARS_PER_LINE)];
}

function cachePathFor(text, label) {
  const hash = createHash("sha256")
    .update(`${text}|${label ?? ""}`)
    .digest("hex")
    .slice(0, 16);
  return join(X_MEDIA_CACHE_DIR, `quote-${hash}.png`);
}

function buildQuoteCardSvg({ text, label }) {
  const lines = wrapText(text);
  const lineHeight = 52;
  const startY = label ? 200 : 220;
  const tspans = lines
    .map(
      (line, i) =>
        `<tspan x="96" ${i === 0 ? `y="${startY}"` : `dy="${lineHeight}"`}>${escapeXml(line)}</tspan>`,
    )
    .join("");

  const labelBlock = label
    ? `<text x="96" y="150" fill="#60a5fa" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="600">${escapeXml(label)}</text>`
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${CARD_WIDTH}" height="${CARD_HEIGHT}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#0a0a0a"/>
  <rect x="0" y="0" width="8" height="100%" fill="#3b82f6"/>
  ${labelBlock}
  <text fill="#f5f5f5" font-family="system-ui, -apple-system, sans-serif" font-size="40" font-weight="500">
    ${tspans}
  </text>
  <text x="96" y="${CARD_HEIGHT - 56}" fill="#737373" font-family="system-ui, -apple-system, sans-serif" font-size="24">@igoorjm · igorjm.github.io</text>
</svg>`;
}

async function loadSharp() {
  return requireWebDevDep("sharp");
}

export async function renderQuoteCard({ text, label = null }) {
  mkdirSync(X_MEDIA_CACHE_DIR, { recursive: true });
  const outPath = cachePathFor(text, label);
  if (existsSync(outPath)) {
    return outPath;
  }

  const svg = buildQuoteCardSvg({ text, label });
  const sharp = await loadSharp();
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}
