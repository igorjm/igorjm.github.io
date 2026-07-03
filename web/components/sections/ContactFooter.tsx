"use client";

import { useTranslations } from "next-intl";
import { Reveal } from "@/components/ui/Reveal";
import { socialLinks } from "@/lib/constants/social";

const links = [
  { key: "github" as const, href: socialLinks.github },
  { key: "linkedin" as const, href: socialLinks.linkedin },
  { key: "twitter" as const, href: socialLinks.twitter },
  { key: "email" as const, href: socialLinks.email },
];

export function ContactFooter() {
  const t = useTranslations("contact");
  const year = new Date().getFullYear();

  return (
    <footer
      id="contact"
      className="mx-auto w-full max-w-container-max px-gutter py-20"
    >
      <Reveal direction="up">
        <div className="flex flex-col items-center justify-between gap-6 border-t border-section pt-20 md:flex-row">
          <div className="text-headline-sm font-bold text-on-surface">{t("headline")}</div>
          <ul className="flex flex-wrap justify-center gap-4">
            {links.map((link, index) => (
              <li key={link.key}>
                <Reveal direction="up" delay={0.08 * index}>
                  <a
                    href={link.href}
                    target={link.key === "email" ? undefined : "_blank"}
                    rel={link.key === "email" ? undefined : "noopener noreferrer"}
                    className="text-label-mono text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {t(link.key)}
                  </a>
                </Reveal>
              </li>
            ))}
          </ul>
          <div className="text-body-md text-on-surface-variant">
            {t("copyright", { year })}
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
