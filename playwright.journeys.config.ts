import { getEnv } from "@daodao/config";
import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./apps/product/e2e/journeys",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  maxFailures: 3,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  retries: 0,
  outputDir: "artifacts/journeys/test-results",
  reporter: [
    ["list"],
    ["html", { outputFolder: "artifacts/journeys/html", open: "never" }],
    ["json", { outputFile: "artifacts/journeys/results.json" }],
  ],
  use: {
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    baseURL: getEnv("JOURNEY_PRODUCT_URL", "http://127.0.0.1:3001"),
    locale: "zh-TW",
    timezoneId: "Asia/Taipei",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "desktop", use: { browserName: "chromium", viewport: { width: 1280, height: 900 } } },
    { name: "mobile", use: { browserName: "chromium", viewport: { width: 390, height: 844 } } },
  ],
});
