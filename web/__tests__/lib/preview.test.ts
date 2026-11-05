import { describe, expect, it } from "vitest";
import {
  getLivePreviewUrl,
  getLocalPreviewPath,
  normalizeHomepageUrl,
} from "@/lib/preview";
import { PROJECT_PREVIEW_DIR } from "@/lib/constants/assets";

describe("normalizeHomepageUrl", () => {
  it.each([null, undefined, "", "   "])("returns null for %j", (value) => {
    expect(normalizeHomepageUrl(value)).toBeNull();
  });

  it.each(["http://example.com", "https://example.com/path"])(
    "preserves an existing protocol: %s",
    (value) => {
      expect(normalizeHomepageUrl(value)).toBe(value);
    }
  );

  it("trims an existing URL", () => {
    expect(normalizeHomepageUrl("  https://example.com  ")).toBe(
      "https://example.com"
    );
  });

  it("adds https to a bare domain and trims it", () => {
    expect(normalizeHomepageUrl("  example.com/project  ")).toBe(
      "https://example.com/project"
    );
  });
});

describe("preview URL helpers", () => {
  it("encodes the deployed URL and requests the configured screenshot", () => {
    const deployedUrl = "https://example.com/a path?mode=preview&x=1";
    const previewUrl = getLivePreviewUrl(deployedUrl);

    expect(previewUrl).toContain(`url=${encodeURIComponent(deployedUrl)}`);
    expect(previewUrl).toContain("screenshot=true");
    expect(previewUrl).toContain("embed=screenshot.url");
    expect(previewUrl).toContain("viewport.width=1280");
    expect(previewUrl).toContain("viewport.height=720");
  });

  it("builds a local WebP path under the project preview directory", () => {
    expect(getLocalPreviewPath("my-project")).toBe(
      `${PROJECT_PREVIEW_DIR}/my-project.webp`
    );
  });
});
