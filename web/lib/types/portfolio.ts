export type Project = {
  id: string;
  name: string;
  descriptionKey: string;
  repoUrl: string;
  deployedUrl: string | null;
  screenshotUrl: string | null;
  previewImage?: string | null;
  language: string;
  tags: string[];
  status?: "wip";
};

export type ExperienceEntry = {
  id: string;
  isCurrent?: boolean;
};

export type SkillIconKey =
  | "java"
  | "javascript"
  | "typescript"
  | "nodejs"
  | "react"
  | "react-native"
  | "nextjs"
  | "spring"
  | "postgresql"
  | "docker"
  | "git"
  | "agile"
  | "jasper"
  | "cursor"
  | "claude"
  | "copilot";

export type Skill = {
  name: string;
  icon: SkillIconKey;
};

export type SkillGroup = {
  id: string;
  labelKey: string;
  skills: Skill[];
};

export type Profile = {
  name: string;
  location: string;
  company: string;
  githubUsername: string;
  twitterHandle: string;
  email: string;
  phone: string;
  resumeUrl: string;
};
