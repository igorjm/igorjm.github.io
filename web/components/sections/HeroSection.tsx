"use client";

import { useTranslations } from "next-intl";
import { motion, useScroll, useTransform } from "framer-motion";
import { HeroBackground } from "@/components/ui/HeroBackground";
import { Reveal } from "@/components/ui/Reveal";
import { profile } from "@/lib/data/profile";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

export function HeroSection() {
  const t = useTranslations("hero");
  const reducedMotion = usePrefersReducedMotion();
  const { scrollY } = useScroll();

  const contentY = useTransform(scrollY, [0, 400], [0, reducedMotion ? 0 : 80]);
  const contentOpacity = useTransform(scrollY, [0, 320], [1, reducedMotion ? 1 : 0.3]);

  return (
    <HeroBackground>
      <motion.div style={{ y: contentY, opacity: contentOpacity }}>
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-8">
            <Reveal direction="up" delay={0.1}>
              <h1 className="text-display-lg mb-6 text-on-surface">{t("headline")}</h1>
            </Reveal>
            <Reveal direction="up" delay={0.22}>
              <p className="text-body-lg mb-12 max-w-2xl text-on-surface-variant">
                {t("subtitle")}
              </p>
            </Reveal>
            <Reveal direction="up" delay={0.34}>
              <div className="flex flex-col gap-6 sm:flex-row">
                <a
                  href="#projects"
                  className="text-label-mono inline-flex items-center justify-center rounded bg-cta px-12 py-4 text-white transition-transform hover:-translate-y-1"
                >
                  {t("cta_primary")}
                </a>
                {profile.resumeUrl ? (
                  <a
                    href={profile.resumeUrl}
                    download
                    className="text-label-mono inline-flex items-center justify-center rounded border border-section px-12 py-4 text-on-surface transition-colors hover:bg-surface-container-high/50"
                  >
                    {t("cta_secondary")}
                  </a>
                ) : (
                  <span
                    className="text-label-mono inline-flex cursor-not-allowed items-center justify-center rounded border border-section px-12 py-4 text-on-surface-variant opacity-60"
                    title={t("resume_unavailable")}
                  >
                    {t("cta_secondary")}
                  </span>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </motion.div>
    </HeroBackground>
  );
}
