import type { ReactNode } from "react";

type IconProps = {
  children: ReactNode;
  size?: number;
  strokeWidth?: number;
  className?: string;
};

/** Outline icon wrapper holding the svg presentation shared by every icon. */
export function Icon({
  children,
  size = 24,
  strokeWidth = 1.75,
  className,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {children}
    </svg>
  );
}
