export function engagementScore(signal) {
  const m = signal.metrics ?? {};
  const likes = m.like_count ?? 0;
  const rts = m.retweet_count ?? 0;
  const replies = m.reply_count ?? 0;
  return likes + rts * 2 + replies * 1.5;
}

export function rankSignalsByEngagement(signals) {
  return [...signals]
    .filter((s) => s.text && s.id)
    .sort((a, b) => engagementScore(b) - engagementScore(a));
}

export function formatSignalForPrompt(signal) {
  const m = signal.metrics ?? {};
  const score = Math.round(engagementScore(signal));
  const stats = `♥ ${m.like_count ?? 0} RT ${m.retweet_count ?? 0} 💬 ${m.reply_count ?? 0} (score ${score})`;
  return `- @${signal.handle} [id: ${signal.id}] (${stats})\n  ${signal.text}\n  ${signal.url}`;
}
