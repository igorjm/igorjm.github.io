"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import {
  sectionLabelClassName,
  sectionShellClassName,
} from "@/lib/constants/styles";
import { cn } from "@/lib/utils";

type SectionShellProps = {
  id?: string;
  children: ReactNode;
  className?: string;
};

/** Top-level section wrapper with the shared divider and vertical rhythm. */
export function SectionShell({ id, children, className }: SectionShellProps) {
  return (
    <section id={id} className={cn(sectionShellClassName, className)}>
      {children}
    </section>
  );
}

/** Revealed uppercase heading announcing a section. */
export function SectionLabel({ label }: { label: string }) {
  return (
    <Reveal direction="left" delay={0.05}>
      <h2 className={sectionLabelClassName}>{label}</h2>
    </Reveal>
  );
}

type SectionGridProps = SectionShellProps & {
  label: string;
};

export function SectionGrid({
  id,
  label,
  children,
  className,
}: SectionGridProps) {
  return (
    <SectionShell id={id} className={className}>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-3">
          <SectionLabel label={label} />
        </div>
        <div className="md:col-span-8 lg:col-span-9">{children}</div>
      </div>
    </SectionShell>
  );
}
