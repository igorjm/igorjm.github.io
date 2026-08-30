import type { Transition, UseInViewOptions } from "framer-motion";

/** Shared spring used by layout indicators and badge hover/layout transitions. */
export const layoutSpring: Transition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
};

/** Ease used by scroll reveals. */
export const revealEase = [0.16, 1, 0.3, 1] as const;

/** Viewport options shared by scroll-reveal wrappers. */
export const revealInViewOptions: UseInViewOptions = {
  once: true,
  margin: "-60px",
};
