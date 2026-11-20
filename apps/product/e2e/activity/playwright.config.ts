import { getEnv } from "@daodao/config";
import { defineConfig } from "@playwright/test";

// This suite uses HTTP fixtures and needs no database, credentials or global setup.
export default defineConfig({
  testDir: "./__tests__",
  outputDir: "../../test-results/activity",
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  use: {
    baseURL: getEnv("E2E_PRODUCT_BASE_URL", "http://127.0.0.1:3001"),
    locale: "zh-TW",
    timezoneId: "Asia/Taipei",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
});
