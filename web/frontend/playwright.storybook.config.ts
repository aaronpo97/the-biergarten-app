import { defineConfig } from '@playwright/test';

const port = process.env.STORYBOOK_PORT ?? '6006';
const baseURL = process.env.STORYBOOK_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
   testDir: './tests/playwright',
   timeout: 30_000,
   retries: process.env.CI ? 2 : 0,
   use: {
      baseURL,
      trace: 'on-first-retry',
   },
   webServer: {
      command: `npm run storybook -- --ci --port ${port}`,
      url: baseURL,
      reuseExistingServer: true,
      timeout: 120_000,
   },
});
