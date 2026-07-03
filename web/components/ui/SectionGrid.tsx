"use client";

import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

type SectionGridProps = {
  id?: string;
  label: string;
  children: ReactNode;
  className?: string;
};

export function SectionGrid({ id, label, children, className }: SectionGridProps) {
  return (
    <section
      id={id}
      className={`border-t border-section py-20 md:py-[80px] ${className ?? ""}`}
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-3">
          <Reveal direction="left" delay={0.05}>
            <h2 className="text-label-mono uppercase tracking-widest text-on-surface-variant">
              {label}
            </h2>
          </Reveal>
        </div>
        <div className="md:col-span-8 lg:col-span-9">{children}</div>
      </div>
    </section>
  );
}
