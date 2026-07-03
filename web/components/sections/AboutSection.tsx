"use client";

import { useTranslations } from "next-intl";
import { SectionGrid } from "@/components/ui/SectionGrid";
import { Reveal } from "@/components/ui/Reveal";

export function AboutSection() {
  const t = useTranslations("about");

  return (
    <SectionGrid id="about" label={t("label")}>
      <Reveal direction="up" delay={0.1}>
        <p className="text-body-lg leading-relaxed text-on-surface">{t("body")}</p>
      </Reveal>
    </SectionGrid>
  );
}
