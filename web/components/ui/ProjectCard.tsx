"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import type { Project } from "@/lib/types/portfolio";
import { cn } from "@/lib/utils";

type ProjectCardProps = {
  project: Project;
};

function getDescriptionNamespace(descriptionKey: string): string {
  return descriptionKey.replace("projects.", "").replace(".description", "");
}

function ProjectThumbnail({
  project,
  noDeployLabel,
  previewUnavailableLabel,
}: {
  project: Project;
  noDeployLabel: string;
  previewUnavailableLabel: string;
}) {
  const sources = useMemo(
    () =>
      [project.previewImage, project.screenshotUrl].filter(
        (url): url is string => Boolean(url)
      ),
    [project.previewImage, project.screenshotUrl]
  );

  const [sourceIndex, setSourceIndex] = useState(0);
  const [exhausted, setExhausted] = useState(false);

  const src = sources[sourceIndex] ?? null;

  if (!src || exhausted) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-2 bg-surface-container-highest">
        <span className="text-headline-sm font-display text-primary opacity-60">
          {project.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="text-label-mono text-on-surface-variant">
          {project.deployedUrl ? previewUnavailableLabel : noDeployLabel}
        </span>
      </div>
    );
  }

  return (
    <Image
      key={src}
      src={src}
      alt={project.name}
      width={640}
      height={360}
      className="size-full object-cover object-top opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
      unoptimized
      onError={() => {
        if (sourceIndex < sources.length - 1) {
          setSourceIndex((index) => index + 1);
        } else {
          setExhausted(true);
        }
      }}
    />
  );
}

export function ProjectCard({ project }: ProjectCardProps) {
  const t = useTranslations("projects");
  const descKey = getDescriptionNamespace(project.descriptionKey);
  const primaryHref = project.deployedUrl ?? project.repoUrl;
  const opensLive = Boolean(project.deployedUrl);

  return (
    <article className="group relative overflow-hidden rounded-lg border border-section bg-surface-container-low transition-transform duration-300 hover:-translate-y-1">
      <a
        href={primaryHref}
        target="_blank"
        rel="noopener noreferrer"
        className="block"
        aria-label={
          opensLive
            ? `${project.name} — ${t("view_live")}`
            : `${project.name} — ${t("view_code")}`
        }
      >
        <div className="aspect-video w-full overflow-hidden bg-surface-container-highest">
          <ProjectThumbnail
            project={project}
            noDeployLabel={t("no_deploy")}
            previewUnavailableLabel={t("preview_unavailable")}
          />
        </div>
        <div className="p-6">
          <h3 className="text-headline-sm mb-2 text-on-surface">{project.name}</h3>
          <p className="text-body-md mb-4 text-on-surface-variant">
            {t(`${descKey}.description`)}
          </p>
          <div className="flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span key={tag} className="text-label-mono text-secondary-fixed-dim">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </a>
      <div className="flex gap-4 border-t border-section px-6 py-3">
        {project.deployedUrl && (
          <a
            href={project.deployedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-label-mono text-primary hover:underline"
          >
            {t("view_live")}
          </a>
        )}
        <a
          href={project.repoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-label-mono hover:underline",
            project.deployedUrl ? "text-on-surface-variant" : "text-primary"
          )}
        >
          {t("view_code")}
        </a>
      </div>
    </article>
  );
}
