import { normalizeHomepageUrl, getLivePreviewUrl } from "@/lib/preview";
import type { Project } from "@/lib/types/portfolio";

/** Sourced from GitHub — https://github.com/igorjm pinned repos */
export const projects: Project[] = [
  {
    id: "cog-jackpot",
    name: "cog-jackpot",
    descriptionKey: "projects.cogJackpot.description",
    repoUrl: "https://github.com/igorjm/cog-jackpot",
    deployedUrl: "https://bolao-cog.vercel.app/login",
    screenshotUrl: getLivePreviewUrl("https://bolao-cog.vercel.app/login"),
    language: "TypeScript",
    tags: ["Next.js", "TypeScript", "Vercel"],
  },
  {
    id: "igorjm-github-io",
    name: "igorjm.github.io",
    descriptionKey: "projects.portfolio.description",
    repoUrl: "https://github.com/igorjm/igorjm.github.io",
    deployedUrl: "https://igorjm.github.io",
    screenshotUrl: getLivePreviewUrl("https://igorjm.github.io"),
    language: "TypeScript",
    tags: ["Next.js", "TypeScript", "Tailwind"],
  },
  {
    id: "nextjs-crypto-tracker",
    name: "nextjs-crypto-tracker",
    descriptionKey: "projects.cryptoTracker.description",
    repoUrl: "https://github.com/igorjm/nextjs-crypto-tracker",
    deployedUrl: normalizeHomepageUrl("nextjs-crypto-tracker-rho.vercel.app"),
    screenshotUrl: getLivePreviewUrl("https://nextjs-crypto-tracker-rho.vercel.app"),
    language: "JavaScript",
    tags: ["Next.js", "React", "API"],
  },
  {
    id: "nextjs-meal-plan-saas",
    name: "nextjs-meal-plan-saas",
    descriptionKey: "projects.mealPlanSaas.description",
    repoUrl: "https://github.com/igorjm/nextjs-meal-plan-saas",
    deployedUrl: null,
    screenshotUrl: null,
    language: "TypeScript",
    tags: ["Next.js", "Clerk", "Stripe", "AI"],
  },
  {
    id: "brewra",
    name: "brewra",
    descriptionKey: "projects.brewra.description",
    repoUrl: "https://github.com/igorjm/brewra",
    deployedUrl: "https://coffeebrewra.vercel.app/en",
    screenshotUrl: getLivePreviewUrl("https://coffeebrewra.vercel.app/en"),
    language: "TypeScript",
    tags: ["React Native", "Next.js", "Stripe", "AI"],
  },
];
