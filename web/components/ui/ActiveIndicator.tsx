"use client";

import { motion } from "framer-motion";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { layoutSpring } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ActiveIndicatorProps = {
  layoutId: string;
  className?: string;
};

/** Underline that slides between the active nav link or filter. */
export function ActiveIndicator({ layoutId, className }: ActiveIndicatorProps) {
  const reducedMotion = usePrefersReducedMotion();
  const barClassName = cn("absolute h-0.5 bg-primary", className);

  if (reducedMotion) {
    return <span className={barClassName} />;
  }

  return (
    <motion.span
      layoutId={layoutId}
      className={barClassName}
      transition={layoutSpring}
    />
  );
}
