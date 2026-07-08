import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/sections/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ContactFooter } from "@/components/sections/ContactFooter";
import { ScrollEffects } from "@/components/layout/ScrollEffects";
import { routing } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ScrollEffects />
      <Navbar />
      <HeroSection />
      <main className="mx-auto flex max-w-container-max flex-col gap-section px-gutter pb-14 md:pb-16">
        <AboutSection />
        <TechStackSection />
        <ExperienceSection />
        <ProjectsSection />
      </main>
      <ContactFooter />
    </>
  );
}
