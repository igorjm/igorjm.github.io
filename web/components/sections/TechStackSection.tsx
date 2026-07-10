"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { SectionGrid } from "@/components/ui/SectionGrid";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { Reveal } from "@/components/ui/Reveal";
import { skillGroups } from "@/lib/data/skills";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { cn } from "@/lib/utils";

type FilterId = "all" | (typeof skillGroups)[number]["id"];

const filterIds: FilterId[] = ["all", ...skillGroups.map((group) => group.id)];

export function TechStackSection() {
  const t = useTranslations("tech");
  const [active, setActive] = useState<FilterId>("all");
  const reducedMotion = usePrefersReducedMotion();

  const visibleGroups = useMemo(
    () =>
      active === "all"
        ? skillGroups
        : skillGroups.filter((group) => group.id === active),
    [active]
  );

  const showCategoryHeaders = active === "all";

  return (
    <SectionGrid id="tech" label={t("label")}>
      <Reveal>
        <div className="mb-8 flex gap-6 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {filterIds.map((id) => {
            const isActive = active === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActive(id)}
                className={cn(
                  "text-label-mono relative shrink-0 cursor-pointer pb-1.5 transition-colors",
                  isActive
                    ? "font-bold text-primary"
                    : "text-on-surface-variant hover:text-primary"
                )}
              >
                {t(id as "all" | "languages" | "frameworks" | "tools" | "ai")}
                {isActive &&
                  (reducedMotion ? (
                    <span className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary" />
                  ) : (
                    <motion.span
                      layoutId="tech-filter-indicator"
                      className="absolute inset-x-0 -bottom-0.5 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ))}
              </button>
            );
          })}
        </div>

        <LayoutGroup>
          <motion.div
            layout
            className={cn(
              showCategoryHeaders
                ? "grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4"
                : undefined
            )}
          >
            <AnimatePresence mode="popLayout">
              {visibleGroups.map((group) => (
                <motion.div
                  key={group.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{
                    layout: { type: "spring", stiffness: 380, damping: 30 },
                    opacity: { duration: 0.2 },
                  }}
                >
                  {showCategoryHeaders && (
                    <h3 className="text-headline-sm mb-4 border-b border-section pb-2 text-on-surface">
                      {t(group.id as "languages" | "frameworks" | "tools" | "ai")}
                    </h3>
                  )}
                  <div className="flex flex-wrap gap-2.5">
                    {group.skills.map((skill) => (
                      <SkillBadge
                        key={`${group.id}-${skill.name}`}
                        layoutId={`${group.id}-${skill.name}`}
                        name={skill.name}
                        icon={skill.icon}
                      />
                    ))}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      </Reveal>
    </SectionGrid>
  );
}
