"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("nav");

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-section p-1"
      role="group"
      aria-label="Language"
    >
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          className={cn(
            "text-label-mono rounded-full px-2.5 py-1 transition-colors",
            locale === loc
              ? "bg-inverse-primary text-white"
              : "text-on-surface-variant hover:text-primary"
          )}
          aria-current={locale === loc ? "true" : undefined}
        >
          {loc === "en" ? t("locale_en") : t("locale_pt")}
        </button>
      ))}
    </div>
  );
}
