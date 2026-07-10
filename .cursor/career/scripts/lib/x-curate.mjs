import { readFileSync } from "fs";
import { ACHIEVEMENTS_MD, VOICE_X_MD, envInt } from "./x-paths.mjs";
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
      temperature: 0.88,
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
      temperature: 0.88,
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
      temperature: 0.88,
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

function buildFactsBlock() {
  const raw = readMd(ACHIEVEMENTS_MD);
  const sideProjects = raw.match(
    /## Side projects[\s\S]*?(?=\n## |\n---\n|$)/,
  );
  const metrics = [
    "25% processing reduction (Cognyte analytics)",
    "Hackathon AI assistant → global product line",
    "50% report creation time cut",
    "cog-jackpot: 30+ users",
    "Side projects: Brewra, MealPlan AI, Headshots AI, igorjm.github.io",
  ];
  return `${metrics.map((m) => `- ${m}`).join("\n")}\n\n${sideProjects?.[0]?.slice(0, 600) ?? ""}`;
}

const FEW_SHOT_BAD_GOOD = `
BAD (too LinkedIn / AI):
"The delta between 'we bought Copilot' and 'we redesigned how work happens' is where ROI actually lives."

GOOD (personal X):
"everyone has copilot now. almost nobody changed how they actually work. same jira, new sidebar."

BAD:
"Eval data quality is the moat now."

GOOD:
"benchmarks moved again. my brewra eval set is still 40 examples and one bad prompt regresses prod lol"

BAD quote_take:
"The AI product naming chaos is real — and it slows down actual builders."

GOOD quote_take:
"yeah this. i shouldn't need a spreadsheet to pick which model api to call for one feature"
`;

function buildPrompt({ trends, watchlistSignals, dateStr, maxPosts }) {
  const voice = readMd(VOICE_X_MD);
  const facts = buildFactsBlock();
  const ptBr = isPtBrDay(dateStr);
  const maxQuotes = envInt("X_MAX_QUOTE_TAKES_PER_DAY", 2);
  const maxRetweets = envInt("X_MAX_RETWEETS_PER_DAY", 1);

  const trendBlock = JSON.stringify(trends, null, 2).slice(0, 1500);
  const ranked = rankSignalsByEngagement(watchlistSignals);
  const signalBlock = ranked
    .slice(0, 8)
    .map((s) => formatSignalForPrompt(s))
    .join("\n\n");

  return `You write X posts AS Igor Melo (@igoorjm) — a senior full-stack engineer shipping AI side projects.

Sound like @simonw or @swyx texting between commits. NOT like LinkedIn thought leadership.

VOICE (follow strictly):
${voice}

FACTS (use only these — never invent):
${facts}

TONE CALIBRATION:
${FEW_SHOT_BAD_GOOD}

WATCHLIST (react to these — never copy their text):
${signalBlock}

Trends JSON (low priority — watchlist is better signal):
${trendBlock}

Generate exactly ${maxPosts} drafts as JSON array.

Mix:
- 1 ship log or personal original (type: original or project) — something Igor is building
- 1–${maxQuotes} quote_take — 1–2 short sentences MAX. React ("yeah", "same", "this matches…") + one concrete detail
- 0–${maxRetweets} retweet — empty text, highest-engagement watchlist id
${ptBr ? "- Last item: PT-BR, casual dev Twitter (not manifesto)" : ""}

Hard rules:
- Max 280 chars
- Lowercase ok. Fragments ok. "I" / "my" encouraged
- quote_take: text + quoteTweetId only
- retweet: "" + retweetTweetId only
- No consultant jargon (moat, delta, ROI lives, landscape, leverage)
- No aphorism punchlines as last line
- sourceInspiration URL when using watchlist

JSON only:
[
  {
    "text": "...",
    "type": "original|quote_take|retweet|project",
    "language": "en|pt-BR",
    "quoteTweetId": "optional",
    "retweetTweetId": "optional",
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
    text: "shipped a small thing on brewra last night. nothing flashy — but the loop feels different when the app actually remembers context.",
    type: "project",
    language: "en",
  });

  if (second) {
    drafts.push({
      text: "yeah this. matches what i see — everyone optimizes the model before fixing the eval data.",
      type: "quote_take",
      language: "en",
      quoteTweetId: second.id,
      sourceInspiration: second.url,
    });
  } else if (top) {
    drafts.push({
      text: "this. the boring part is always the data pipeline, not the model pick.",
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
    text: "cog-jackpot passed 30 users. internal pool app, nextjs + vercel. boring stack, people actually use it every week.",
    type: "original",
    language: "en",
  });

  if (isPtBrDay(dateStr)) {
    drafts.push({
      text: "engenharia de IA no dia a dia é mais pipeline e eval do que prompt bonito. pelo menos nos meus side projects é.",
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
