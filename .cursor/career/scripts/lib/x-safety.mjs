import { envInt } from "./x-paths.mjs";

const BLOCKED = [
  "giveaway",
  "crypto moon",
  "guaranteed returns",
  "dm for",
  "passionate developer",
  "rockstar",
  "ninja",
];

export function filterTweet(tweet, context = {}) {
  const issues = [];
  const type = tweet.type ?? "original";
  const isRetweet = type === "retweet";
  let text = tweet.text?.trim() ?? "";

  if (isRetweet) {
    if (!tweet.retweetTweetId) {
      issues.push("retweet missing target id");
    }
    text = "";
  } else {
    if (!text) issues.push("empty text");
    if (text.length > 280) {
      text = text.slice(0, 277) + "...";
      issues.push("truncated to 280");
    }
  }

  const lower = text.toLowerCase();
  for (const word of BLOCKED) {
    if (lower.includes(word)) {
      issues.push(`blocked keyword: ${word}`);
    }
  }

  const urlCount = (text.match(/https?:\/\//g) ?? []).length;
  const totalLinksToday = (context.linksToday ?? 0) + urlCount;
  if (totalLinksToday > 1) {
    issues.push("max 1 link per day exceeded");
  }

  const maxQuotes = envInt("X_MAX_QUOTE_TAKES_PER_DAY", 2);
  const maxRetweets = envInt("X_MAX_RETWEETS_PER_DAY", 1);

  const quoteCount =
    (context.quoteTweetsToday ?? 0) + (tweet.quoteTweetId ? 1 : 0);
  if (quoteCount > maxQuotes) {
    issues.push(`max ${maxQuotes} quote-tweets per day`);
  }

  const retweetCount =
    (context.retweetsToday ?? 0) + (tweet.retweetTweetId ? 1 : 0);
  if (retweetCount > maxRetweets) {
    issues.push(`max ${maxRetweets} pure retweets per day`);
  }

  if (context.publishedTexts?.length && text) {
    for (const prev of context.publishedTexts) {
      if (similarity(text, prev) > 0.85) {
        issues.push("too similar to recent post");
        break;
      }
    }
  }

  return {
    ok: issues.filter((i) => !i.startsWith("truncated")).length === 0,
    text,
    issues,
  };
}

function similarity(a, b) {
  const wa = new Set(a.toLowerCase().split(/\s+/));
  const wb = new Set(b.toLowerCase().split(/\s+/));
  let inter = 0;
  for (const w of wa) {
    if (wb.has(w)) inter++;
  }
  return inter / Math.max(wa.size, wb.size, 1);
}

export function filterTweetBatch(tweets, context = {}) {
  const approved = [];
  let linksToday = context.linksToday ?? 0;
  let quoteTweetsToday = context.quoteTweetsToday ?? 0;
  let retweetsToday = context.retweetsToday ?? 0;
  const publishedTexts = [...(context.publishedTexts ?? [])];
  const usedTargets = new Set();

  for (const tweet of tweets) {
    const targetId = tweet.retweetTweetId ?? tweet.quoteTweetId;
    if (targetId && usedTargets.has(targetId)) {
      continue;
    }

    const result = filterTweet(tweet, {
      linksToday,
      quoteTweetsToday,
      retweetsToday,
      publishedTexts,
    });

    if (result.ok) {
      approved.push({ ...tweet, text: result.text });
      linksToday += (result.text.match(/https?:\/\//g) ?? []).length;
      if (tweet.quoteTweetId) quoteTweetsToday++;
      if (tweet.retweetTweetId) retweetsToday++;
      if (targetId) usedTargets.add(targetId);
      if (result.text) publishedTexts.push(result.text);
    }
  }

  return approved;
}
