"use client";

import { useTranslations } from "next-intl";
import { SectionGrid } from "@/components/ui/SectionGrid";
import { Reveal } from "@/components/ui/Reveal";

export function AboutSection() {
  const t = useTranslations("about");

  const facts = [
    t("facts.experience"),
    t("facts.location"),
    t("facts.focus"),
  ];

  return (
    <SectionGrid id="about" label={t("label")}>
      <div className="flex flex-col gap-8">
        <Reveal direction="up" delay={0.1}>
          <h3 className="text-headline-sm max-w-3xl text-on-surface">{t("headline")}</h3>
        </Reveal>

        <Reveal direction="up" delay={0.18}>
          <div className="flex max-w-3xl flex-col gap-5">
            <p className="text-body-lg leading-relaxed text-on-surface-variant">{t("body")}</p>
            <p className="text-body-lg leading-relaxed text-on-surface-variant">
              {t("body_secondary")}
            </p>
          </div>
        </Reveal>

        <Reveal direction="up" delay={0.26}>
          <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
            {facts.map((fact) => (
              <li
                key={fact}
                className="text-label-mono border-l border-section pl-4 text-secondary-fixed-dim"
              >
                {fact}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </SectionGrid>
  );
}
