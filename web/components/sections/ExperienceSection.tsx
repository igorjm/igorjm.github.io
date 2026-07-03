"use client";

import { useTranslations } from "next-intl";
import { SectionGrid } from "@/components/ui/SectionGrid";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { experience } from "@/lib/data/experience";
import { cn } from "@/lib/utils";

export function ExperienceSection() {
  const t = useTranslations("experience");

  return (
    <SectionGrid id="timeline" label={t("label")}>
      <Stagger className="flex flex-col gap-12" stagger={0.12}>
        {experience.map((entry) => (
          <StaggerItem key={entry.id}>
            <div className="relative border-l border-section pl-4 transition-colors hover:border-primary/40">
              <div
                className={cn(
                  "absolute -left-[5px] top-1.5 size-2 rounded-full transition-transform duration-300 group-hover:scale-125",
                  entry.isCurrent ? "bg-primary shadow-[0_0_12px_var(--color-primary)]" : "bg-surface-variant"
                )}
              />
              <h3 className="text-headline-sm text-on-surface">
                {t(`${entry.id}.title`)}
              </h3>
              <div
                className={cn(
                  "text-label-mono mb-2",
                  entry.isCurrent ? "text-primary" : "text-on-surface-variant"
                )}
              >
                {t(`${entry.id}.company`)} ({t(`${entry.id}.period`)})
              </div>
              <p className="text-body-md text-on-surface-variant">
                {t(`${entry.id}.description`)}
              </p>
            </div>
          </StaggerItem>
        ))}
      </Stagger>
    </SectionGrid>
  );
}
