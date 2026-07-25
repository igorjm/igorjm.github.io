import { PROJECT_PREVIEW_DIR } from "@/lib/constants/assets";

export function normalizeHomepageUrl(homepage: string | null | undefined): string | null {
  if (!homepage?.trim()) return null;
  const trimmed = homepage.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Free live preview via Microlink (no API key required on free tier).
 * Returns a URL that responds with image/png directly.
 * @see https://microlink.io/docs/api/parameters/screenshot
 */
export function getLivePreviewUrl(deployedUrl: string): string {
  const encoded = encodeURIComponent(deployedUrl);
  return `https://api.microlink.io/?url=${encoded}&screenshot=true&embed=screenshot.url&viewport.width=1280&viewport.height=720`;
}

/**
 * Local pre-generated preview served from our own origin (instant, no cold
 * start). Generate with `npm run previews:generate`. Cards fall back to the
 * live Microlink URL if a local file is ever missing.
 */
export function getLocalPreviewPath(projectId: string): string {
  return `${PROJECT_PREVIEW_DIR}/${projectId}.webp`;
}
