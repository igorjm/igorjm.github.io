"use client";

import { useEffect, useState } from "react";

const sectionIds = ["hero", "about", "tech", "timeline", "projects", "contact"] as const;

export type ActiveSection = (typeof sectionIds)[number];

export function useActiveSection() {
  const [active, setActive] = useState<ActiveSection>("hero");

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target.id) {
          setActive(visible[0].target.id as ActiveSection);
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return active;
}

export const navSectionMap = {
  work: "projects",
  about: "about",
  tech: "tech",
  timeline: "timeline",
  contact: "contact",
} as const;
