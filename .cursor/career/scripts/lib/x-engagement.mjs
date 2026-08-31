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

const MAX_SIGNAL_CHARS = 400;

/**
 * Third-party tweet text is untrusted input that ends up inside an LLM prompt.
 * Collapse it to a single line and remove sequences that could close the data
 * fence or read as instructions to the model.
 */
export function sanitizeUntrustedText(text) {
  return String(text ?? "")
    .replace(/[\r\n\t]+/g, " ")
    .replace(/```+/g, "'")
    .replace(/<\/?untrusted[^>]*>/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SIGNAL_CHARS);
}

export function formatSignalForPrompt(signal) {
  const m = signal.metrics ?? {};
  const score = Math.round(engagementScore(signal));
  const stats = `♥ ${m.like_count ?? 0} RT ${m.retweet_count ?? 0} 💬 ${m.reply_count ?? 0} (score ${score})`;
  const handle = sanitizeUntrustedText(signal.handle).replace(/^@/, "");
  return `- @${handle} [id: ${signal.id}] (${stats})\n  ${sanitizeUntrustedText(signal.text)}\n  ${signal.url}`;
}
