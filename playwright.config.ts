import { getEnv } from "@daodao/config";
import { defineConfig, devices } from "@playwright/test";

const productBaseUrl = getEnv("E2E_PRODUCT_BASE_URL", "http://127.0.0.1:3001");
const artifactsRoot = getEnv("E2E_ARTIFACTS_DIR", "artifacts/future-letter-playwright");

export default defineConfig({
  testDir: "./apps/product/e2e",
  globalSetup: "./apps/product/e2e/global-setup.ts",
  outputDir: `${artifactsRoot}/test-results`,
  fullyParallel: false,
  workers: 1,
  retries: getEnv("CI") ? 1 : 0,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["json", { outputFile: `${artifactsRoot}/results.json` }],
    ["html", { outputFolder: `${artifactsRoot}/html`, open: "never" }],
  ],
  use: {
    baseURL: productBaseUrl,
    locale: "zh-TW",
    timezoneId: "Asia/Taipei",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "on",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
