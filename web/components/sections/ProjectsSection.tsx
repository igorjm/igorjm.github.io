"use client";

import { useTranslations } from "next-intl";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { projects } from "@/lib/data/projects";

export function ProjectsSection() {
  const t = useTranslations("projects");

  return (
    <section id="projects" className="border-t border-section py-20 md:py-[80px]">
      <div className="mb-12 grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-3">
          <Reveal direction="left" delay={0.05}>
            <h2 className="text-label-mono uppercase tracking-widest text-on-surface-variant">
              {t("label")}
            </h2>
          </Reveal>
        </div>
      </div>
      <Stagger className="grid grid-cols-1 gap-12 md:grid-cols-2" stagger={0.1}>
        {projects.map((project) => (
          <StaggerItem key={project.id}>
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}
