import { getAccessToken } from "./x-auth.mjs";
import { X_API_BASE } from "./x-paths.mjs";

async function xFetch(path, options = {}) {
  const token = await getAccessToken();
  const url = path.startsWith("http") ? path : `${X_API_BASE}${path}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (res.status === 429) {
    const retryAfter = res.headers.get("retry-after") ?? "60";
    throw new Error(`Rate limited. Retry after ${retryAfter}s`);
  }

  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(`X API ${res.status}: ${JSON.stringify(data)}`);
  }

  return data;
}

export async function searchRecent(query, maxResults = 10) {
  const params = new URLSearchParams({
    query,
    max_results: String(Math.min(maxResults, 100)),
    "tweet.fields": "created_at,public_metrics,author_id",
  });
  return xFetch(`/2/tweets/search/recent?${params}`);
}

export async function getUserByUsername(username) {
  const handle = username.replace(/^@/, "");
  const params = new URLSearchParams({
    "user.fields": "description,public_metrics",
  });
  return xFetch(`/2/users/by/username/${handle}?${params}`);
}

export async function getUserTweets(userId, maxResults = 5) {
  const params = new URLSearchParams({
    max_results: String(Math.min(maxResults, 100)),
    "tweet.fields": "created_at,public_metrics",
    exclude: "retweets,replies",
  });
  return xFetch(`/2/users/${userId}/tweets?${params}`);
}

export async function getTrends(woeid = "1") {
  try {
    return await xFetch(`/2/trends/by/woeid/${woeid}`);
  } catch {
    return null;
  }
}

export async function createTweet({ text, quoteTweetId, mediaIds }) {
  const body = { text };
  if (quoteTweetId) {
    body.quote_tweet_id = quoteTweetId;
  }
  if (mediaIds?.length) {
    body.media = { media_ids: mediaIds };
  }
  return xFetch("/2/tweets", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchWatchlistSignal(handles) {
  const signals = [];

  for (const handle of handles.slice(0, 6)) {
    try {
      const userRes = await getUserByUsername(handle);
      const user = userRes?.data;
      if (!user?.id) continue;

      const tweetsRes = await getUserTweets(user.id, 3);
      const tweets = tweetsRes?.data ?? [];

      for (const t of tweets) {
        signals.push({
          handle,
          id: t.id,
          text: t.text,
          created_at: t.created_at,
          url: `https://x.com/${handle.replace("@", "")}/status/${t.id}`,
        });
      }
    } catch (err) {
      signals.push({
        handle,
        error: err.message,
      });
    }
  }

  return signals;
}

export async function fetchTrendSignals(woeid = "1") {
  const trends = await getTrends(woeid);
  if (trends?.data) {
    return trends.data.map((t) => ({
      name: t.trend_name ?? t.name,
      volume: t.tweet_count,
    }));
  }

  const search = await searchRecent(
    "(AI OR LLM OR \"machine learning\") -is:retweet lang:en",
    10,
  );
  return (search?.data ?? []).map((t) => ({
    id: t.id,
    text: t.text?.slice(0, 200),
    source: "search",
  }));
}
