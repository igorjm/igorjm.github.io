import type { SkillGroup } from "@/lib/types/portfolio";

export const skillGroups: SkillGroup[] = [
  {
    id: "languages",
    labelKey: "tech.languages",
    skills: ["Java", "JavaScript", "TypeScript", "Node.js"],
  },
  {
    id: "frameworks",
    labelKey: "tech.frameworks",
    skills: ["React", "React Native", "Next.js", "Spring MVC"],
  },
  {
    id: "tools",
    labelKey: "tech.tools",
    skills: ["PostgreSQL", "Docker", "Git", "Agile", "JasperReports"],
  },
];
