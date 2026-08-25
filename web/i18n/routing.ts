import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "pt-BR"],
  defaultLocale: "en",
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];

export function isSupportedLocale(
  locale: string | undefined
): locale is AppLocale {
  return Boolean(locale) && routing.locales.includes(locale as AppLocale);
}

/** `generateStaticParams` payload for every route segmented by locale. */
export function localeStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
