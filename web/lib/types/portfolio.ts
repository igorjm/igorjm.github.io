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
};

export type ExperienceEntry = {
  id: string;
  isCurrent?: boolean;
};

export type SkillGroup = {
  id: string;
  labelKey: string;
  skills: string[];
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
