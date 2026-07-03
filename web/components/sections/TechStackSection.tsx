"use client";

import { useTranslations } from "next-intl";
import { SectionGrid } from "@/components/ui/SectionGrid";
import { SkillBadge } from "@/components/ui/SkillBadge";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { skillGroups } from "@/lib/data/skills";

export function TechStackSection() {
  const t = useTranslations("tech");

  return (
    <SectionGrid id="tech" label={t("label")}>
      <Stagger className="grid grid-cols-1 gap-12 sm:grid-cols-3" stagger={0.14}>
        {skillGroups.map((group) => (
          <StaggerItem key={group.id}>
            <div>
              <h3 className="text-headline-sm mb-4 border-b border-section pb-2 text-on-surface">
                {t(group.id as "languages" | "frameworks" | "tools")}
              </h3>
              <div className="flex flex-wrap gap-2">
                {group.skills.map((skill) => (
                  <SkillBadge key={skill}>{skill}</SkillBadge>
                ))}
              </div>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionGrid>
  );
}
