import { defineConfig, devices } from '@playwright/test'
import { ChromaticConfig } from '@chromatic-com/playwright'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig<ChromaticConfig>({
  testDir: './tests/e2e',
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
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3001',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Set locale to Wellington, NZ */
    geolocation: { longitude: 174.77623, latitude: -41.286461 },
    locale: 'en-NZ',
    timezoneId: 'Pacific/Auckland',

    /* Put playwright var in local storage so we can hide the background video */
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3001',
          localStorage: [
            {
              name: 'is_playwright_test',
              value: '1',
            },
          ],
        },
      ],
    },

    /* Chromatic snapshot settings */
    disableAutoSnapshot: true,
    delay: 2000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 7'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm run build && NO_PROXY=1 pnpm run preview --port 3001',
    port: 3001,
    reuseExistingServer: !process.env.CI,
  },
})
