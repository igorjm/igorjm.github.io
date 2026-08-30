import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";
import type { SkillIconKey } from "@/lib/types/portfolio";
import { cn } from "@/lib/utils";

const iconPaths: Record<SkillIconKey, ReactNode> = {
  java: (
    <>
      <path d="M8.5 18.5c1.5 1.2 3.2 1.8 5 1.8 1.6 0 3-.5 4-1.4" />
      <path d="M7.5 15.5c1.8 1.4 3.8 2.1 6 2.1 1.8 0 3.4-.5 4.6-1.5" />
      <path d="M12 3c.4 2.2-.2 3.8-1.5 5.2C9 9.8 8.2 11.2 8.5 13c.4 2.2 2.2 3.2 3.5 3.2s3.1-1 3.5-3.2c.3-1.8-.5-3.2-2-4.8C12.2 6.8 11.6 5.2 12 3Z" />
      <path d="M10.5 5.5c1.2-.8 2.8-.8 4 0" />
    </>
  ),
  javascript: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M10 8.5v7.2c0 1.4-.7 2-1.8 2-.7 0-1.3-.2-1.7-.5" />
      <path d="M13.5 13.2c.4-.5 1-.8 1.7-.8 1.1 0 1.8.6 1.8 1.6 0 2.2-3.5 1.8-3.5 4.2 0 .9.6 1.5 1.7 1.5.8 0 1.5-.3 2-.8" />
    </>
  ),
  typescript: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M7.5 10.5h5.5M10.2 10.5V17" />
      <path d="M14.2 13.2c.35-.45.9-.7 1.55-.7.95 0 1.55.5 1.55 1.3 0 1.85-3.1 1.5-3.1 3.55 0 .75.55 1.3 1.5 1.3.7 0 1.3-.25 1.75-.7" />
    </>
  ),
  nodejs: (
    <>
      <path d="M12 2.5 19.5 7v10L12 21.5 4.5 17V7L12 2.5Z" />
      <path d="M9.5 10.5c0-1.2.9-2 2.2-2 1.1 0 1.9.5 2.2 1.3M9.5 14.8c.4.9 1.2 1.4 2.3 1.4 1.4 0 2.3-.8 2.3-2.1V10" />
    </>
  ),
  react: (
    <>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
    </>
  ),
  "react-native": (
    <>
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="12" rx="10" ry="4" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" />
      <rect x="8.5" y="5" width="7" height="14" rx="1.5" opacity="0.35" fill="currentColor" stroke="none" />
    </>
  ),
  nextjs: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9 8v8M9 8h2.2c1.8 0 3 1 3 2.8S13 13.6 11.2 13.6H9" />
      <path d="M14.5 16.5 16 8" />
    </>
  ),
  spring: (
    <>
      <path d="M12 3c-2.5 3.5-5.5 5.2-8 5.5 2.2 4.5 5.5 7.5 9.5 9.5-1-3.5-.5-6.5 1.5-9.5C12.5 10 11 12.5 11 15.5c2.5-2 4.5-5 5-8.5C14 8.5 12.5 6 12 3Z" />
      <path d="M16.5 6.5c1 .8 1.8 2 2.2 3.5" />
    </>
  ),
  postgresql: (
    <>
      <path d="M12 3c-3.5 0-5.5 1.8-5.5 4.2 0 2.8 2.2 4.3 5.5 5.3 3.3-1 5.5-2.5 5.5-5.3C17.5 4.8 15.5 3 12 3Z" />
      <path d="M6.5 10.5v3.2c0 2.2 2.4 4 5.5 4.8 3.1-.8 5.5-2.6 5.5-4.8v-3.2" />
      <path d="M9.5 8.5c.3 1.2 1.2 2 2.5 2.3" />
      <path d="M8 19.5c1.2.4 2.5.6 4 .6s2.8-.2 4-.6" />
    </>
  ),
  docker: (
    <>
      <path d="M3.5 13.5h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm-6-3h2v2h-2zm3 0h2v2h-2zm3 0h2v2h-2zm-3-3h2v2h-2z" fill="currentColor" stroke="none" />
      <path d="M2.5 16.5c.8 2.2 3 3.5 6.2 3.5 4.5 0 7.8-2.2 9.3-5.5 1.2.1 2.5-.3 3.2-1.3-1.5.1-2.6-.3-3.4-1.2-.5.8-1.5 1.3-2.8 1.3H2.5c-.2.8-.2 2.1 0 3.2Z" />
    </>
  ),
  git: (
    <>
      <path d="M12.5 3.2 20.8 11.5a1.5 1.5 0 0 1 0 2.1L13.5 20.9a1.5 1.5 0 0 1-2.1 0L3.1 12.6a1.5 1.5 0 0 1 0-2.1L11.4 3.2a1.5 1.5 0 0 1 2.1 0Z" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.2" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <path d="M12 8.4V12M13.2 12h2" />
    </>
  ),
  agile: (
    <>
      <path d="M7 7.5h10M7 12h7M7 16.5h4" />
      <path d="M17.5 11.5 20 14l-2.5 2.5" />
      <path d="M20 14h-5.5" />
    </>
  ),
  jasper: (
    <>
      <path d="M6 4.5h12v15H6z" />
      <path d="M9 8h6M9 11.5h6M9 15h4" />
      <path d="M15.5 15.5 18 18" />
    </>
  ),
  cursor: (
    <>
      <path d="M5 4.5 19 12l-6.2 1.6L10.5 20.5 5 4.5Z" />
      <path d="M12.8 13.6 16.5 19" />
    </>
  ),
  claude: (
    <>
      <path d="M8.5 19.5 12 4.5l3.5 15" />
      <path d="M6 14.5h12" />
      <path d="M7.5 10.5h9" />
    </>
  ),
  copilot: (
    <>
      <path d="M8 8.5c0-2 1.5-3.5 3.5-3.5h1c2 0 3.5 1.5 3.5 3.5v1.5c0 1.2-.5 2.2-1.3 2.9L12 15.5l-2.7-2.1A3.8 3.8 0 0 1 8 10V8.5Z" />
      <circle cx="10.2" cy="9.2" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="13.8" cy="9.2" r="0.9" fill="currentColor" stroke="none" />
      <path d="M9 17.5c.8.7 1.8 1 3 1s2.2-.3 3-1" />
      <path d="M5.5 11.5c-.8.5-1.3 1.4-1.3 2.5 0 1.8 1.4 3 3.2 3" />
      <path d="M18.5 11.5c.8.5 1.3 1.4 1.3 2.5 0 1.8-1.4 3-3.2 3" />
    </>
  ),
};

type SkillIconProps = {
  name: SkillIconKey;
  className?: string;
};

export function SkillIcon({ name, className }: SkillIconProps) {
  return (
    <Icon size={14} strokeWidth={1.5} className={cn("shrink-0", className)}>
      {iconPaths[name]}
    </Icon>
  );
}
