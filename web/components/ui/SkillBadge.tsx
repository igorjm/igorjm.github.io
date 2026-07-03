import { cn } from "@/lib/utils";

export function SkillBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "text-label-mono rounded bg-badge px-3 py-1 text-secondary-fixed-dim",
        className
      )}
    >
      {children}
    </span>
  );
}
