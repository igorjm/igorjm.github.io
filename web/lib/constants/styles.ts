/** Centered page container shared by the nav, hero, sections and footer. */
export const containerClassName = "mx-auto w-full max-w-container-max px-gutter";

/** Vertical rhythm shared by top-level sections. */
export const sectionPaddingY = "py-14 md:py-16";

/** Section wrapper: divider plus vertical rhythm. */
export const sectionShellClassName = `border-t border-section ${sectionPaddingY}`;

/** Small uppercase mono label used for section headings. */
export const sectionLabelClassName =
  "text-label-mono uppercase tracking-widest text-on-surface-variant";

/** Shared geometry for the hero call-to-action buttons. */
export const ctaBaseClassName =
  "text-label-mono inline-flex items-center justify-center rounded px-12 py-4";

/** Mono nav/filter link, emphasised while its section or filter is active. */
export function navLinkClassName(isActive: boolean) {
  return isActive
    ? "font-bold text-primary"
    : "text-on-surface-variant hover:text-primary";
}
