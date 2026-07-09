import { readFileSync } from "fs";
import { PROFILE_MD, VOICE_X_MD, envInt } from "./x-paths.mjs";
import { getPostSlotsForDay, isPtBrDay } from "./x-schedule.mjs";
import { assignImageStrategies } from "./x-media.mjs";
import {
  rankSignalsByEngagement,
  formatSignalForPrompt,
} from "./x-engagement.mjs";

function readMd(path) {
  return readFileSync(path, "utf8");
}

async function callAnthropic(prompt) {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`Anthropic: ${JSON.stringify(data)}`);
  return data.content?.[0]?.text ?? "";
}

async function callOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`OpenAI: ${JSON.stringify(data)}`);
  return data.choices?.[0]?.message?.content ?? "";
}

async function callXAI(prompt) {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.XAI_MODEL ?? "grok-2-latest",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(`xAI: ${JSON.stringify(data)}`);
  return data.choices?.[0]?.message?.content ?? "";
}

async function callLLM(prompt) {
  if (process.env.ANTHROPIC_API_KEY) return callAnthropic(prompt);
  if (process.env.OPENAI_API_KEY) return callOpenAI(prompt);
  if (process.env.XAI_API_KEY) return callXAI(prompt);
  return null;
}

function hasLlmKey() {
  return Boolean(
    process.env.ANTHROPIC_API_KEY ||
      process.env.OPENAI_API_KEY ||
      process.env.XAI_API_KEY,
  );
}

function buildPrompt({ trends, watchlistSignals, dateStr, maxPosts }) {
  const voice = readMd(VOICE_X_MD);
  const profile = readMd(PROFILE_MD).slice(0, 3000);
  const ptBr = isPtBrDay(dateStr);
  const maxQuotes = envInt("X_MAX_QUOTE_TAKES_PER_DAY", 2);
  const maxRetweets = envInt("X_MAX_RETWEETS_PER_DAY", 1);

  const trendBlock = JSON.stringify(trends, null, 2).slice(0, 2000);
  const ranked = rankSignalsByEngagement(watchlistSignals);
  const signalBlock = ranked
    .slice(0, 10)
    .map((s) => formatSignalForPrompt(s))
    .join("\n\n");

  return `You draft original X (Twitter) posts for Igor Melo, Senior Software Engineer.

VOICE RULES:
${voice}

PROFILE (facts only):
${profile}

TODAY'S TRENDS/SIGNAL:
${trendBlock}

WATCHLIST POSTS (ranked by engagement — inspiration only, NEVER copy text):
${signalBlock}

Generate exactly ${maxPosts} tweet drafts as JSON array.

DAILY MIX (aim for this balance):
- 1–2 original commentary (type: original)
- 1–${maxQuotes} quote_take — retweet WITH your comment (quote tweet on X). Pick strong watchlist posts; add a sharp engineer take in text.
- 0–${maxRetweets} retweet — pure amplify, NO comment text. Pick the highest-engagement watchlist post that fits Igor's AI/engineering lens.
- 0–1 project mention (MealPlan AI, Brewra, portfolio)
${ptBr ? "- Include 1 post in PT-BR as the last item" : ""}

Rules:
- Max 280 chars for any text field
- Original synthesis only — do not paraphrase watchlist posts in your comment
- quote_take: requires text + quoteTweetId (watchlist id)
- retweet: text must be empty string "" + retweetTweetId (watchlist id). Never use both quoteTweetId and retweetTweetId on the same draft.
- Include sourceInspiration URL when using a watchlist post
- No hashtags unless 1-2 feel natural at end
- No engagement bait, no job seeking

Respond with ONLY valid JSON array:
[
  {
    "text": "...",
    "type": "original|quote_take|retweet|project",
    "language": "en|pt-BR",
    "quoteTweetId": "optional — quote_take only",
    "retweetTweetId": "optional — retweet only",
    "sourceInspiration": "optional url"
  }
]`;
}

function normalizeDrafts(drafts, watchlistSignals) {
  const validIds = new Set(
    watchlistSignals.filter((s) => s.id).map((s) => String(s.id)),
  );

  return drafts.map((d) => {
    const type = d.type ?? "original";
    let quoteTweetId = d.quoteTweetId ? String(d.quoteTweetId) : null;
    let retweetTweetId = d.retweetTweetId ? String(d.retweetTweetId) : null;

    if (type === "quote_take") {
      if (!quoteTweetId && retweetTweetId) quoteTweetId = retweetTweetId;
      retweetTweetId = null;
    } else if (type === "retweet") {
      if (!retweetTweetId && quoteTweetId) retweetTweetId = quoteTweetId;
      quoteTweetId = null;
    } else {
      retweetTweetId = null;
      if (type !== "quote_take") quoteTweetId = null;
    }

    const targetId = retweetTweetId ?? quoteTweetId;
    if (targetId && !validIds.has(targetId)) {
      const fromUrl = watchlistSignals.find(
        (s) => s.url && d.sourceInspiration?.includes(s.id),
      );
      if (fromUrl) {
        if (type === "retweet") retweetTweetId = String(fromUrl.id);
        else quoteTweetId = String(fromUrl.id);
      }
    }

    return {
      ...d,
      type,
      quoteTweetId: type === "quote_take" ? quoteTweetId : null,
      retweetTweetId: type === "retweet" ? retweetTweetId : null,
      text: type === "retweet" ? "" : (d.text ?? "").trim(),
    };
  });
}

function parseJsonArray(text) {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

function fallbackDrafts({ watchlistSignals, dateStr, maxPosts }) {
  const drafts = [];
  const ranked = rankSignalsByEngagement(watchlistSignals);
  const top = ranked[0];
  const second = ranked[1];

  drafts.push({
    text: "AI news moves fast. The builder question isn't which model — it's eval data, latency, and what you ship this week.",
    type: "original",
    language: "en",
  });

  if (second) {
    drafts.push({
      text: "Strong signal on AI eval this week. Most teams optimize models before they fix the data pipeline. That's backwards.",
      type: "quote_take",
      language: "en",
      quoteTweetId: second.id,
      sourceInspiration: second.url,
    });
  } else if (top) {
    drafts.push({
      text: "Worth amplifying — this is the eval gap most production AI teams still ignore.",
      type: "quote_take",
      language: "en",
      quoteTweetId: top.id,
      sourceInspiration: top.url,
    });
  }

  if (top && envInt("X_MAX_RETWEETS_PER_DAY", 1) > 0) {
    const quotedId = drafts.find((d) => d.quoteTweetId)?.quoteTweetId;
    if (top.id !== quotedId) {
      drafts.push({
        text: "",
        type: "retweet",
        language: "en",
        retweetTweetId: top.id,
        sourceInspiration: top.url,
      });
    }
  }

  drafts.push({
    text: "Side projects hit different when they're full-stack: auth, billing, deploy. That's the bar I use for MealPlan AI and Brewra.",
    type: "project",
    language: "en",
  });

  if (isPtBrDay(dateStr)) {
    drafts.push({
      text: "Engenharia de IA não é só prompt — é pipeline de dados, eval e produto que alguém usa toda semana.",
      type: "original",
      language: "pt-BR",
    });
  }

  return drafts.slice(0, maxPosts);
}

export async function curateTweets({
  trends,
  watchlistSignals,
  dateStr,
  maxPosts,
}) {
  const prompt = buildPrompt({ trends, watchlistSignals, dateStr, maxPosts });
  let drafts = null;
  let fallbackReason = null;

  if (!hasLlmKey()) {
    fallbackReason =
      "no LLM API key in web/.env.x (ANTHROPIC_API_KEY, OPENAI_API_KEY, or XAI_API_KEY)";
  } else {
    try {
      const raw = await callLLM(prompt);
      if (!raw) {
        fallbackReason = "LLM returned empty response";
      } else {
        drafts = parseJsonArray(raw);
        if (!drafts?.length) {
          fallbackReason = "LLM response was not a valid JSON array";
        }
      }
    } catch (err) {
      fallbackReason = err.message;
    }
  }

  if (!drafts?.length) {
    console.warn(`LLM curation unavailable (${fallbackReason}) — using template drafts`);
    drafts = fallbackDrafts({ watchlistSignals, dateStr, maxPosts });
  }

  drafts = normalizeDrafts(drafts, watchlistSignals);

  const slots = getPostSlotsForDay(dateStr, drafts.length);

  const tweets = drafts.map((d, i) => ({
    text: d.text,
    type: d.type ?? "original",
    language: d.language ?? "en",
    quoteTweetId: d.quoteTweetId ?? null,
    retweetTweetId: d.retweetTweetId ?? null,
    sourceInspiration: d.sourceInspiration ?? null,
    scheduledAt: slots[i],
    posted: false,
  }));

  return assignImageStrategies(tweets);
}

export function formatBriefingMarkdown({
  dateStr,
  trends,
  watchlistSignals,
  tweets,
  dryRun,
}) {
  const lines = [
    `# X Morning Briefing — ${dateStr}`,
    "",
    `Generated: ${new Date().toISOString()}`,
    `Mode: ${dryRun ? "DRY RUN (no auto-post)" : "LIVE"}`,
    "",
    "## Trends / search signal",
    "",
    "```json",
    JSON.stringify(trends, null, 2).slice(0, 3000),
    "```",
    "",
    "## Watchlist signal",
    "",
  ];

  for (const s of watchlistSignals.slice(0, 10)) {
    if (s.text) {
      lines.push(`- **${s.handle}**: ${s.text.slice(0, 120)}…`);
      lines.push(`  ${s.url}`);
    } else if (s.error) {
      lines.push(`- **${s.handle}**: (fetch error — check API credentials)`);
    }
  }

  lines.push("", "## Queued tweets", "");

  tweets.forEach((t, i) => {
    const imageNote =
      t.imageStrategy && t.imageStrategy !== "none"
        ? ` · image: ${t.imageStrategy}`
        : "";
    lines.push(
      `### ${i + 1}. ${t.type} (${t.language}) — ${t.scheduledAt}${imageNote}`,
    );
    lines.push("");
    if (t.type === "retweet") {
      lines.push("```");
      lines.push(`[pure retweet — no comment]`);
      lines.push("```");
      if (t.retweetTweetId) {
        lines.push(`Target: https://x.com/i/web/status/${t.retweetTweetId}`);
      }
    } else {
      lines.push("```");
      lines.push(t.text);
      lines.push("```");
      if (t.quoteTweetId) {
        lines.push(`Quote: https://x.com/i/web/status/${t.quoteTweetId}`);
      }
    }
    if (t.imageLabel) {
      lines.push(`Image label: ${t.imageLabel}`);
    }
    if (t.sourceInspiration) {
      lines.push(`Inspiration: ${t.sourceInspiration}`);
    }
    lines.push("");
  });

  return lines.join("\n");
}
