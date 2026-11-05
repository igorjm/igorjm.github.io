import { describe, expect, it } from "vitest";
import en from "@/messages/en.json";
import ptBr from "@/messages/pt-BR.json";
import { experience } from "@/lib/data/experience";
import { profile } from "@/lib/data/profile";
import { projects } from "@/lib/data/projects";
import { skillGroups } from "@/lib/data/skills";
import { ASSETS, PROJECT_PREVIEW_DIR } from "@/lib/constants/assets";
import { socialLinks } from "@/lib/constants/social";
import { getLivePreviewUrl, getLocalPreviewPath } from "@/lib/preview";
import { colors, typography } from "@/lib/theme";
import type { SkillIconKey } from "@/lib/types/portfolio";

const iconKeys: Record<SkillIconKey, true> = {
  java: true,
  javascript: true,
  typescript: true,
  nodejs: true,
  react: true,
  "react-native": true,
  nextjs: true,
  spring: true,
  postgresql: true,
  docker: true,
  git: true,
  agile: true,
  jasper: true,
  cursor: true,
  claude: true,
  copilot: true,
};

function hasMessageKey(messages: unknown, key: string) {
  return key.split(".").reduce<unknown>((value, segment) => {
    if (typeof value !== "object" || value === null) return undefined;
    return (value as Record<string, unknown>)[segment];
  }, messages) !== undefined;
}

function expectAbsoluteHttpsUrl(value: string) {
  const url = new URL(value);
  expect(url.protocol).toBe("https:");
  expect(url.hostname).not.toBe("");
}

function expectNonEmpty(value: string) {
  expect(value.trim()).not.toBe("");
}

describe("portfolio data integrity", () => {
  it("contains complete projects with valid URLs and matching preview helpers", () => {
    const ids = projects.map((project) => project.id);
    expect(new Set(ids).size).toBe(ids.length);

    projects.forEach((project) => {
      [
        project.id,
        project.name,
        project.descriptionKey,
        project.repoUrl,
        project.language,
      ].forEach(expectNonEmpty);
      expect(project.tags.length).toBeGreaterThan(0);
      expectAbsoluteHttpsUrl(project.repoUrl);
      expect(project.deployedUrl).not.toBeNull();
      expectAbsoluteHttpsUrl(project.deployedUrl!);
      expect(project.previewImage).toBe(getLocalPreviewPath(project.id));
      expect(project.previewImage).toMatch(
        new RegExp(`^${PROJECT_PREVIEW_DIR}/.+\\.webp$`)
      );
      expect(project.screenshotUrl).toBe(
        getLivePreviewUrl(project.deployedUrl!)
      );
      expect(hasMessageKey(en, project.descriptionKey)).toBe(true);
      expect(hasMessageKey(ptBr, project.descriptionKey)).toBe(true);
    });
  });

  it("contains unique, translated skill groups with known icon keys", () => {
    const ids = skillGroups.map((group) => group.id);
    expect(new Set(ids).size).toBe(ids.length);

    skillGroups.forEach((group) => {
      expectNonEmpty(group.id);
      expectNonEmpty(group.labelKey);
      expect(hasMessageKey(en, group.labelKey)).toBe(true);
      expect(hasMessageKey(ptBr, group.labelKey)).toBe(true);
      expect(group.skills.length).toBeGreaterThan(0);

      group.skills.forEach((skill) => {
        expectNonEmpty(skill.name);
        expect(iconKeys[skill.icon]).toBe(true);
      });
    });
  });

  it("contains complete experience and profile records", () => {
    const ids = experience.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    experience.forEach((entry) => {
      expectNonEmpty(entry.id);
      ["title", "company", "period", "description"].forEach((field) => {
        const key = `experience.${entry.id}.${field}`;
        expect(hasMessageKey(en, key)).toBe(true);
        expect(hasMessageKey(ptBr, key)).toBe(true);
      });
    });

    Object.values(profile).forEach(expectNonEmpty);
    expectNonEmpty(ASSETS.resume);
    expect(ASSETS.logo).toMatch(/^\/.+/);
    expect(ASSETS.profile).toMatch(/^\/.+/);
    expect(PROJECT_PREVIEW_DIR).toBe("/projects");
  });

  it("keeps external social links secure and the email link explicit", () => {
    [socialLinks.github, socialLinks.linkedin, socialLinks.twitter].forEach(
      expectAbsoluteHttpsUrl
    );
    expect(socialLinks.email).toMatch(/^mailto:[^@]+@[^@]+$/);
  });
});

describe("theme token integrity", () => {
  it("uses the same color token keys in light and dark themes", () => {
    expect(Object.keys(colors.light).sort()).toEqual(
      Object.keys(colors.dark).sort()
    );
    Object.values(colors).forEach((mode) =>
      Object.values(mode).forEach((value) =>
        expect(value).toMatch(/^#[\da-f]{6}$/i)
      )
    );
  });

  it("defines required typography properties for every text style", () => {
    Object.values(typography).forEach((entry) => {
      expectNonEmpty(entry.fontSize);
      expectNonEmpty(entry.lineHeight);
      expectNonEmpty(entry.fontWeight);
    });
  });
});
