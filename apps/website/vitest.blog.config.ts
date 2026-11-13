import { defineConfig } from "vitest/config";
export default defineConfig({
  oxc: { jsx: { runtime: "automatic" } },
  test: { include: ["src/components/blog/__tests__/*.test.ts"] },
});
