import type { SkillGroup } from "@/lib/types/portfolio";

export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    labelKey: "tech.languages",
    skills: [
      { name: "Java", icon: "java" },
      { name: "JavaScript", icon: "javascript" },
      { name: "TypeScript", icon: "typescript" },
      { name: "Node.js", icon: "nodejs" },
    ],
  },
  {
    id: "frameworks",
    labelKey: "tech.frameworks",
    skills: [
      { name: "React", icon: "react" },
      { name: "React Native", icon: "react-native" },
      { name: "Next.js", icon: "nextjs" },
      { name: "Spring MVC", icon: "spring" },
    ],
  },
  {
    id: "tools",
    labelKey: "tech.tools",
    skills: [
      { name: "PostgreSQL", icon: "postgresql" },
      { name: "Docker", icon: "docker" },
      { name: "Git", icon: "git" },
      { name: "Agile", icon: "agile" },
      { name: "JasperReports", icon: "jasper" },
    ],
  },
  {
    id: "ai",
    labelKey: "tech.ai",
    skills: [
      { name: "Cursor", icon: "cursor" },
      { name: "Claude", icon: "claude" },
      { name: "GitHub Copilot", icon: "copilot" },
    ],
  },
];
