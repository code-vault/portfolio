import { defineConfig, devices } from '@playwright/test';

// Minimal typing for the one Node global we use (avoids adding @types/node just for this).
declare const process: { env: Record<string, string | undefined> };

// Tests run against the BUILT site (`astro preview` serves dist/).
// Locally use `npm test` (it builds first). CI builds in an earlier step, then runs Playwright.
const PORT = 4321;

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI, // fail CI if someone leaves test.only in
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'on-first-retry',
  },
  webServer: {
    command: `npm run preview -- --host 127.0.0.1 --port ${PORT} --ignore-lock`,
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    // BLOCKING: everything except the external-link check. These must pass to deploy.
    {
      name: 'site',
      testIgnore: /external-links\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    // NON-BLOCKING: other people's websites can be down or block bots, so this runs in its own CI job.
    {
      name: 'external',
      testMatch: /external-links\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
