import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  use: {
    launchOptions: { executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH },
    baseURL: "http://127.0.0.1:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.PLAYWRIGHT_TEST_PRODUCTION
      ? "npm run start"
      : "npm run dev",
    url: "http://127.0.0.1:3000/caseload",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
