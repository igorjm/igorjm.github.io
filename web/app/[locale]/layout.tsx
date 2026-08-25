import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  Inter,
  JetBrains_Mono,
  Plus_Jakarta_Sans,
} from "next/font/google";
import { isSupportedLocale, localeStaticParams } from "@/i18n/routing";
import { ASSETS } from "@/lib/constants/assets";
import { Providers } from "@/components/layout/Providers";
import "../globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });
  const ogLocale = locale === "pt-BR" ? "pt_BR" : "en_US";

  return {
    title: t("title"),
    description: t("description"),
    metadataBase: new URL("https://igorjm.github.io"),
    icons: {
      icon: [{ url: ASSETS.logo, type: "image/png" }],
      apple: [{ url: ASSETS.logo, type: "image/png" }],
    },
    openGraph: {
      title: t("title"),
      description: t("og_description"),
      url: "https://igorjm.github.io",
      siteName: "Igor Melo",
      locale: ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("og_description"),
      creator: "@igoorjm",
    },
  };
}

export const generateStaticParams = localeStaticParams;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isSupportedLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${plusJakarta.variable} ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">
        <Providers>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
