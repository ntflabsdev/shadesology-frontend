import { defineConfig } from "@playwright/test";

const apiUrl = "http://127.0.0.1:5100";
const webUrl = "http://127.0.0.1:3100";
const accessibilityOnly = process.env.PHASE1_A11Y === "true";

export default defineConfig({
  testDir: accessibilityOnly ? "./tests" : "./tests/e2e",
  testMatch: accessibilityOnly ? "**/accessibility.spec.ts" : "**/*.spec.ts",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: "list",
  workers: 1,
  use: {
    baseURL: webUrl,
    headless: true,
  },
  webServer: [
    {
      command: "node tests/e2e/mock-api-server.cjs",
      url: `${apiUrl}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "npm run dev -- --webpack --hostname 127.0.0.1 --port 3100",
      url: webUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        NEXT_PUBLIC_API_URL: apiUrl,
        NEXT_PUBLIC_GA_MEASUREMENT_ID: "G-TEST12345",
        PHASE1_E2E: "true",
      },
    },
  ],
});
