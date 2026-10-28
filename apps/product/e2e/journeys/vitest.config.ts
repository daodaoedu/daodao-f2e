import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["apps/product/e2e/journeys/__tests__/**/*.test.ts"], environment: "node" },
});
