"use client";

import { motion } from "framer-motion";
import type { SkillIconKey } from "@/lib/types/portfolio";
import { SkillIcon } from "@/components/ui/SkillIcon";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { layoutSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type SkillBadgeProps = {
  name: string;
  icon: SkillIconKey;
  className?: string;
  layoutId?: string;
};

const badgeClassName =
  "text-label-mono inline-flex cursor-pointer items-center gap-1.5 rounded border border-transparent bg-badge px-3 py-1.5 text-secondary-fixed-dim transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary";

export function SkillBadge({ name, icon, className, layoutId }: SkillBadgeProps) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return (
      <span className={cn(badgeClassName, className)}>
        <SkillIcon name={icon} />
        {name}
      </span>
    );
  }

  return (
    <motion.span
      layout
      layoutId={layoutId}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      whileHover={{ y: -2, scale: 1.04 }}
      transition={{
        layout: layoutSpring,
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        y: { type: "spring", stiffness: 420, damping: 22 },
      }}
      className={cn(badgeClassName, className)}
    >
      <SkillIcon name={icon} />
      {name}
    </motion.span>
  );
}
