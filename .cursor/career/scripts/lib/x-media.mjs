import { existsSync } from "fs";
import { envFlag } from "./x-paths.mjs";
import { renderQuoteCard } from "./x-media-render.mjs";
import { captureProjectScreenshot } from "./x-media-screenshot.mjs";
import { uploadImageFile } from "./x-media-upload.mjs";

export const PROJECT_TARGETS = [
  {
    key: "brewra",
    label: "Brewra",
    match: /brewra|coffeebrewra/i,
    url: "https://coffeebrewra.vercel.app/en",
  },
  {
    key: "mealplan",
    label: "MealPlan AI",
    match: /meal\s*plan|mealplan/i,
    url: "https://nextjs-meal-plan-saas.vercel.app",
  },
  {
    key: "headshots",
    label: "Headshots AI",
    match: /headshots/i,
    url: "https://headshots-starter-clone-ashy-zeta.vercel.app",
  },
  {
    key: "portfolio",
    label: "Portfolio",
    match: /igorjm\.github\.io|portfolio/i,
    url: "https://igorjm.github.io",
  },
];

export function detectProjectFromText(text) {
  for (const project of PROJECT_TARGETS) {
    if (project.match.test(text)) {
      return project;
    }
  }
  return null;
}

export function assignImageStrategies(tweets) {
  const enabled = envFlag("X_MEDIA_ENABLED", false);
  const screenshots = envFlag("X_SCREENSHOT_ENABLED", false);
  const maxImages = parseInt(process.env.X_IMAGE_POSTS_PER_DAY ?? "1", 10) || 1;

  if (!enabled || maxImages < 1) {
    return tweets.map((t) => ({
      ...t,
      imageStrategy: "none",
      imageSource: null,
      imageLabel: null,
      mediaPath: null,
      mediaId: null,
    }));
  }

  let assigned = 0;
  const result = tweets.map((t) => ({
    ...t,
    imageStrategy: "none",
    imageSource: null,
    imageLabel: null,
    mediaPath: null,
    mediaId: null,
  }));

  const tryAssign = (idx, strategy, source, label) => {
    if (assigned >= maxImages || idx < 0) return;
    result[idx].imageStrategy = strategy;
    result[idx].imageSource = source;
    result[idx].imageLabel = label;
    assigned += 1;
  };

  const projectIdx = result.findIndex((t) => t.type === "project");
  if (projectIdx >= 0) {
    const project = detectProjectFromText(result[projectIdx].text);
    if (project && screenshots) {
      tryAssign(
        projectIdx,
        "project_screenshot",
        { type: "url", key: project.key, url: project.url },
        project.label,
      );
    } else {
      tryAssign(
        projectIdx,
        "quote_card",
        { type: "quote_card" },
        project?.label ?? "Building in public",
      );
    }
  }

  if (assigned < maxImages) {
    const originalIdx = result.findIndex(
      (t) =>
        t.type === "original" &&
        t.imageStrategy === "none" &&
        t.text.length >= 80 &&
        !t.quoteTweetId,
    );
    if (originalIdx >= 0) {
      tryAssign(originalIdx, "quote_card", { type: "quote_card" }, null);
    }
  }

  return result;
}

async function resolveMediaPath(item) {
  if (item.mediaPath && existsSync(item.mediaPath)) {
    return item.mediaPath;
  }

  if (item.imageStrategy === "project_screenshot" && item.imageSource?.url) {
    try {
      return await captureProjectScreenshot(
        item.imageSource.url,
        item.imageSource.key,
      );
    } catch (err) {
      console.warn(
        `Screenshot failed (${item.imageSource.url}), falling back to quote card:`,
        err.message,
      );
    }
  }

  return renderQuoteCard({
    text: item.text,
    label: item.imageLabel,
  });
}

export async function preparePostMedia(item) {
  if (!item.imageStrategy || item.imageStrategy === "none") {
    return { mediaId: null, mediaPath: null };
  }

  if (item.mediaId) {
    return { mediaId: item.mediaId, mediaPath: item.mediaPath ?? null };
  }

  const mediaPath = await resolveMediaPath(item);
  const mediaId = await uploadImageFile(mediaPath);
  return { mediaId, mediaPath };
}
