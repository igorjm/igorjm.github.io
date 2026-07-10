import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = join(__dirname, "../../../..");
export const CAREER_DIR = join(REPO_ROOT, ".cursor/career");
export const SCRIPTS_DIR = join(CAREER_DIR, "scripts");
export const X_CACHE_DIR = join(CAREER_DIR, ".cache/x");
export const X_MEDIA_CACHE_DIR = join(X_CACHE_DIR, "media");
export const X_DAILY_DIR = join(CAREER_DIR, "content/x/daily");
export const X_PUBLISHED_DIR = join(CAREER_DIR, "content/x/published");
export const POST_QUEUE_FILE = join(X_CACHE_DIR, "post-queue.json");
export const TOKEN_CACHE_FILE = join(X_CACHE_DIR, "tokens.json");

export const WATCHLIST_MD = join(CAREER_DIR, "content/x/watchlist.md");
export const VOICE_X_MD = join(CAREER_DIR, "content/x/voice-x.md");
export const POSTING_RULES_MD = join(CAREER_DIR, "content/x/posting-rules.md");
export const ACHIEVEMENTS_MD = join(CAREER_DIR, "achievements.md");
export const PROFILE_MD = join(CAREER_DIR, "profile.md");

export const X_API_BASE = "https://api.x.com";
export const X_OAUTH_TOKEN_URL = "https://api.x.com/2/oauth2/token";
export const X_OAUTH_AUTHORIZE_URL = "https://x.com/i/oauth2/authorize";

export const OAUTH_SCOPES = [
  "tweet.read",
  "tweet.write",
  "users.read",
  "media.write",
  "offline.access",
].join(" ");

export const DEFAULT_WOEID = "1"; // worldwide
export const BRT_OFFSET_HOURS = -3;

export function todayDateStr() {
  return new Date().toISOString().slice(0, 10);
}

export function envFlag(name, defaultValue = false) {
  const v = process.env[name];
  if (v === undefined) return defaultValue;
  return v === "true" || v === "1";
}

export function envInt(name, defaultValue) {
  const v = parseInt(process.env[name] ?? "", 10);
  return Number.isFinite(v) ? v : defaultValue;
}
