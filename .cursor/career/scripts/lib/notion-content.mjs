import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import {
  BRT_OFFSET_HOURS,
  GITHUB_BRIEFING_BASE,
  LINKEDIN_POSTS_MD,
  MEDIA_DIR,
  MEDIA_INDEX_FILE,
  POST_QUEUE_FILE,
  POSTING_CALENDAR_MD,
  X_PUBLISHED_DIR,
} from "./x-paths.mjs";
import {
  dateValue,
  richText,
  selectValue,
  titleText,
  urlValue,
} from "./x-notion.mjs";

function slotToBrt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const utcH = d.getUTCHours();
  const brtH = (utcH + BRT_OFFSET_HOURS + 24) % 24;
  return `${String(brtH).padStart(2, "0")}:00 BRT`;
}

function truncate(text, max = 1900) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function loadMediaIndex() {
  if (!existsSync(MEDIA_INDEX_FILE)) return {};
  try {
    return JSON.parse(readFileSync(MEDIA_INDEX_FILE, "utf8"));
  } catch {
    return {};
  }
}

function listMediaFiles() {
  if (!existsSync(MEDIA_DIR)) return [];
  return readdirSync(MEDIA_DIR).filter((f) =>
    /\.(png|jpe?g|gif|webp)$/i.test(f),
  );
}

function mediaForLinkedInPost(postNum, mediaIndex, mediaNote) {
  const files = [];
  for (const [filename, meta] of Object.entries(mediaIndex)) {
    if (meta.linkedin_posts?.includes(postNum)) {
      files.push(filename);
    }
  }
  if (files.length) return files.join(", ");
  return mediaNote ?? "";
}

function mediaForXProject(text, mediaIndex) {
  const lower = (text ?? "").toLowerCase();
  const hits = [];
  for (const [filename, meta] of Object.entries(mediaIndex)) {
    for (const project of meta.projects ?? []) {
      if (lower.includes(project.toLowerCase())) {
        hits.push(filename);
      }
    }
  }
  return hits.join(", ");
}

export function loadPublishedByDate() {
  const map = new Map();
  if (!existsSync(X_PUBLISHED_DIR)) return map;

  for (const file of readdirSync(X_PUBLISHED_DIR).filter((f) =>
    f.endsWith(".json"),
  )) {
    try {
      const data = JSON.parse(
        readFileSync(join(X_PUBLISHED_DIR, file), "utf8"),
      );
      const date = data.date ?? file.replace(".json", "");
      map.set(date, data.posts ?? []);
    } catch {
      /* skip */
    }
  }
  return map;
}

export function parseLinkedInPosts() {
  if (!existsSync(LINKEDIN_POSTS_MD)) return [];

  const raw = readFileSync(LINKEDIN_POSTS_MD, "utf8");
  const sections = raw.split(/^## Post /m).slice(1);
  const posts = [];

  for (const section of sections) {
    const headerMatch = section.match(
      /^(\d+) — ([^\n]+)(?: \(Week (\d+)\))?/,
    );
    if (!headerMatch) continue;

    const num = parseInt(headerMatch[1], 10);
    const title = headerMatch[2].trim();
    const week = headerMatch[3] ? parseInt(headerMatch[3], 10) : null;

    const mediaMatch = section.match(/\*\*Media:\*\*\s*(.+)/);
    const linkMatch = section.match(/\*\*Link(?: in first comment)?:\*\*\s*(.+)/);
    const bodyMatch = section.match(/```\n([\s\S]*?)```/);
    const body = bodyMatch?.[1]?.trim() ?? "";

    posts.push({
      num,
      title,
      week,
      mediaNote: mediaMatch?.[1]?.trim() ?? "",
      link: linkMatch?.[1]?.trim() ?? "",
      bodyPreview: truncate(body, 500),
      externalId: `linkedin:post:${num}`,
    });
  }

  return posts;
}

export function parsePostingCalendar() {
  const statusByPost = new Map();
  if (!existsSync(POSTING_CALENDAR_MD)) return statusByPost;

  const raw = readFileSync(POSTING_CALENDAR_MD, "utf8");
  const rows = raw.match(/^\| \d+ \|.*Post \d+.*\|/gm) ?? [];

  for (const row of rows) {
    const postMatch = row.match(/Post (\d+)/);
    if (!postMatch) continue;
    const num = parseInt(postMatch[1], 10);
    const parts = row.split("|").map((s) => s.trim());
    const statusCell = parts[4] ?? "";
    const published = statusCell.toLowerCase() === "[x]";
    const urlCell = parts[5] ?? "";
    const publishedUrl = urlCell.startsWith("http") ? urlCell : "";
    statusByPost.set(num, {
      status: published ? "posted" : "draft",
      publishedUrl,
    });
  }

  return statusByPost;
}

export function buildXContentRows({ dateStr, publishedOnly = false }) {
  if (!existsSync(POST_QUEUE_FILE)) return [];

  const queue = JSON.parse(readFileSync(POST_QUEUE_FILE, "utf8"));
  const queueDate = queue.date ?? dateStr;
  const publishedMap = loadPublishedByDate();
  const publishedToday = publishedMap.get(queueDate) ?? [];
  const mediaIndex = loadMediaIndex();
  const briefingUrl = `${GITHUB_BRIEFING_BASE}/${queueDate}-briefing.md`;

  return (queue.tweets ?? []).map((tweet, i) => {
    const slotKey = tweet.scheduledAt ?? `${i}`;
    const externalId = `x:${queueDate}:${slotKey}:${tweet.type ?? "original"}`;

    const published = publishedToday.find(
      (p) =>
        p.text === tweet.text ||
        (tweet.tweetId && p.tweetId === tweet.tweetId),
    );

    const isPosted = tweet.posted || Boolean(published);
    const tweetId = tweet.tweetId ?? published?.tweetId;
    const referenceId = tweet.quoteTweetId ?? tweet.retweetTweetId;
    const referenceUrl = referenceId
      ? `https://x.com/i/web/status/${referenceId}`
      : "";
    const publishedUrl = tweetId
      ? `https://x.com/i/web/status/${tweetId}`
      : "";

    let displayText = tweet.text;
    if (tweet.type === "retweet") {
      displayText = `[pure retweet] ${referenceUrl}`;
    }

    const staticMedia = mediaForXProject(tweet.text, mediaIndex);
    const media =
      staticMedia ||
      (tweet.mediaPath ? tweet.mediaPath.split("/").pop() : "");

    const row = {
      externalId,
      properties: {
        Name: titleText(`${queueDate} · X #${i + 1} · ${tweet.type}`),
        Date: dateValue(queueDate),
        Platform: selectValue("X"),
        Slot: richText(slotToBrt(tweet.scheduledAt)),
        Type: selectValue(tweet.type ?? "original"),
        Status: selectValue(
          isPosted ? "posted" : tweet.skipReason ? "skipped" : "scheduled",
        ),
        Text: richText(truncate(displayText)),
        Language: selectValue(tweet.language ?? "en"),
        Inspiration: urlValue(tweet.sourceInspiration),
        Reference: urlValue(referenceUrl),
        Media: richText(media),
        ImageStrategy: selectValue(
          mapImageStrategy(tweet.imageStrategy),
        ),
        PublishedURL: urlValue(publishedUrl),
        BriefingURL: urlValue(briefingUrl),
      },
    };

    if (publishedOnly && !isPosted) return null;
    return row;
  }).filter(Boolean);
}

function mapImageStrategy(strategy) {
  if (!strategy || strategy === "none") return "none";
  if (strategy === "quote_card") return "quote_card";
  if (strategy === "project_screenshot") return "screenshot";
  return strategy;
}

export function buildLinkedInRows() {
  const posts = parseLinkedInPosts();
  const calendar = parsePostingCalendar();
  const mediaIndex = loadMediaIndex();

  return posts.map((post) => {
    const cal = calendar.get(post.num) ?? { status: "draft", publishedUrl: "" };
    const media = mediaForLinkedInPost(post.num, mediaIndex, post.mediaNote);

    return {
      externalId: post.externalId,
      properties: {
        Name: titleText(`LinkedIn Post ${post.num} — ${post.title}`),
        Date: dateValue(null),
        Platform: selectValue("LinkedIn"),
        Slot: richText(post.week ? `Week ${post.week}` : ""),
        Type: selectValue("linkedin_post"),
        Status: selectValue(cal.status),
        Text: richText(truncate(post.bodyPreview)),
        Language: selectValue("bilingual"),
        Inspiration: urlValue(post.link),
        Reference: urlValue(""),
        Media: richText(media),
        ImageStrategy: selectValue(media ? "static_asset" : "none"),
        PublishedURL: urlValue(cal.publishedUrl),
        BriefingURL: urlValue(""),
      },
    };
  });
}

export function collectNotionRows({ dateStr, publishedOnly = false }) {
  const xRows = buildXContentRows({ dateStr, publishedOnly: false });
  if (publishedOnly) {
    return xRows;
  }
  const linkedInRows = buildLinkedInRows();
  return [...xRows, ...linkedInRows];
}

export function listAvailableMedia() {
  return {
    files: listMediaFiles(),
    index: loadMediaIndex(),
  };
}
