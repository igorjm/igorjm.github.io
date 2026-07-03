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

/** Optional local override: add `web/public/projects/{id}.png` */
export function getLocalPreviewPath(projectId: string): string {
  return `${PROJECT_PREVIEW_DIR}/${projectId}.png`;
}
