"use client";

import { useTranslations } from "next-intl";
import { ProjectCard } from "@/components/ui/ProjectCard";
import { Stagger, StaggerItem } from "@/components/ui/Reveal";
import { SectionLabel, SectionShell } from "@/components/ui/SectionGrid";
import { projects } from "@/lib/data/projects";

export function ProjectsSection() {
  const t = useTranslations("projects");

  return (
    <SectionShell id="projects">
      <div className="mb-10 grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-3">
          <SectionLabel label={t("label")} />
        </div>
      </div>
      <Stagger className="grid grid-cols-1 gap-12 md:grid-cols-2" stagger={0.1}>
        {projects.map((project) => (
          <StaggerItem key={project.id}>
            <ProjectCard project={project} />
          </StaggerItem>
        ))}
      </Stagger>
    </SectionShell>
  );
}
