/** Design tokens extracted from Stitch prototype (project 2632090409844754950) */

export const colors = {
  dark: {
    background: "#111415",
    surface: "#111415",
    surfaceContainerLow: "#191c1d",
    surfaceContainer: "#1d2021",
    surfaceContainerHigh: "#282a2b",
    surfaceContainerHighest: "#323536",
    surfaceVariant: "#323536",
    onBackground: "#e1e3e4",
    onSurface: "#e1e3e4",
    onSurfaceVariant: "#c7c4d7",
    primary: "#c0c1ff",
    primaryFixedDim: "#c0c1ff",
    inversePrimary: "#494bd6",
    onPrimaryContainer: "#0d0096",
    tertiary: "#ffb783",
    tertiaryContainer: "#d97721",
    secondary: "#c8c6c5",
    secondaryFixedDim: "#c8c6c5",
    outline: "#908fa0",
    outlineVariant: "#464554",
    error: "#ffb4ab",
  },
  light: {
    background: "#f4f6f7",
    surface: "#ffffff",
    surfaceContainerLow: "#eef0f1",
    surfaceContainer: "#e8eaeb",
    surfaceContainerHigh: "#e2e4e5",
    surfaceContainerHighest: "#dcdedf",
    surfaceVariant: "#e2e4e5",
    onBackground: "#111415",
    onSurface: "#111415",
    onSurfaceVariant: "#464554",
    primary: "#494bd6",
    primaryFixedDim: "#2f2ebe",
    inversePrimary: "#c0c1ff",
    onPrimaryContainer: "#07006c",
    tertiary: "#703700",
    tertiaryContainer: "#ffb783",
    secondary: "#474646",
    secondaryFixedDim: "#474646",
    outline: "#908fa0",
    outlineVariant: "#c7c4d7",
    error: "#690005",
  },
} as const;

export const spacing = {
  base: "4px",
  xs: "8px",
  sm: "16px",
  md: "24px",
  lg: "48px",
  xl: "80px",
  sectionGap: "0px",
  containerMax: "1200px",
  gutter: "24px",
} as const;

export const radius = {
  default: "0.25rem",
  lg: "0.5rem",
  xl: "0.75rem",
  full: "9999px",
} as const;

export const typography = {
  displayLg: {
    fontSize: "64px",
    lineHeight: "1.1",
    letterSpacing: "-0.04em",
    fontWeight: "800",
  },
  displayLgMobile: {
    fontSize: "40px",
    lineHeight: "1.2",
    letterSpacing: "-0.02em",
    fontWeight: "800",
  },
  headlineMd: {
    fontSize: "32px",
    lineHeight: "1.3",
    fontWeight: "700",
  },
  headlineSm: {
    fontSize: "24px",
    lineHeight: "1.4",
    fontWeight: "600",
  },
  bodyLg: {
    fontSize: "18px",
    lineHeight: "1.7",
    fontWeight: "400",
  },
  bodyMd: {
    fontSize: "16px",
    lineHeight: "1.6",
    fontWeight: "400",
  },
  labelMono: {
    fontSize: "13px",
    lineHeight: "1.2",
    letterSpacing: "0.05em",
    fontWeight: "500",
  },
  caption: {
    fontSize: "14px",
    lineHeight: "1.4",
    fontWeight: "500",
  },
} as const;

export const fonts = {
  display: "var(--font-plus-jakarta)",
  body: "var(--font-inter)",
  mono: "var(--font-jetbrains-mono)",
} as const;
