import { setRequestLocale } from "next-intl/server";
import { Navbar } from "@/components/sections/Navbar";
import { HeroSection } from "@/components/sections/HeroSection";
import { AboutSection } from "@/components/sections/AboutSection";
import { TechStackSection } from "@/components/sections/TechStackSection";
import { ExperienceSection } from "@/components/sections/ExperienceSection";
import { ProjectsSection } from "@/components/sections/ProjectsSection";
import { ContactFooter } from "@/components/sections/ContactFooter";
import { ScrollEffects } from "@/components/layout/ScrollEffects";
import { containerClassName } from "@/lib/constants/styles";
import { cn } from "@/lib/utils";
import { localeStaticParams } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export const generateStaticParams = localeStaticParams;

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <ScrollEffects />
      <Navbar />
      <HeroSection />
      <main
        className={cn(
          containerClassName,
          "flex flex-col gap-section pb-14 md:pb-16"
        )}
      >
        <AboutSection />
        <TechStackSection />
        <ExperienceSection />
        <ProjectsSection />
      </main>
      <ContactFooter />
    </>
  );
}
