import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary", "html"],
      include: [
        "lib/**/*.ts",
        "hooks/**/*.ts",
        "i18n/**/*.ts",
        "components/**/*.tsx",
      ],
      exclude: [
        "lib/types/**",
        "scripts/**",
        ".next/**",
        "out/**",
      ],
    },
  },
});
