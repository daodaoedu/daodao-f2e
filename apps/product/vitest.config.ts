import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Next preserves JSX; the Node test runner must transform imported TSX.
  oxc: {
    jsx: { runtime: "automatic" },
  },
  test: {
    environment: "node",
    server: {
      // Resolve next-intl's extensionless Next imports through Vite instead of native ESM.
      deps: { inline: ["next-intl"] },
    },
    include: ["src/**/__tests__/**/*.test.ts", "src/**/__tests__/**/*.test.tsx"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
