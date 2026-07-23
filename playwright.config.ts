import { defineConfig, devices } from "@playwright/test";
import type { ChromaticConfig } from "@chromatic-com/playwright";
import type { ConfigOptions } from "@nuxt/test-utils/playwright";

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<ChromaticConfig & ConfigOptions>({
  testMatch: "**/tests/e2e/**/*.spec.ts",
  /* Maximum time one test can run for. */
  timeout: 30 * 1000,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 5000,
  },
  /* Run all tests in parallel. */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:8080",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Set locale to Wellington, NZ */
    geolocation: { longitude: 174.77623, latitude: -41.286461 },
    locale: "en-NZ",
    timezoneId: "Pacific/Auckland",

    /* Chromatic snapshot settings */
    disableAutoSnapshot: true,
    delay: 10000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "Desktop Chrome",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 7"],
      },
    },
  ],

  webServer: [
    {
      command: "IS_PLAYWRIGHT=1 npm run dev --workspace=api",
      url: "http://localhost:8787/api/countries/leaderboard",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command:
        "IS_PLAYWRIGHT=1 npm run build --workspace=web && PORT=3000 HOST=0.0.0.0 node web/.output/server/index.mjs",
      url: "http://localhost:3000/",
      reuseExistingServer: !process.env.CI,
      timeout: 180 * 1000,
    },
    {
      command: "docker compose -f playwright.docker-compose.yml up",
      url: "http://localhost:8080/api/countries/leaderboard",
      reuseExistingServer: !process.env.CI,
      timeout: 60 * 1000,
      gracefulShutdown: { signal: "SIGTERM", timeout: 10 * 1000 },
    },
  ],
});
