import { defineConfig } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const port = process.env.STORYBOOK_PORT ?? '6006';
const baseURL = process.env.STORYBOOK_URL ?? `http://127.0.0.1:${port}`;

const bddTestDir = defineBddConfig({
   features: 'tests/playwright/features/*.feature',
   steps: 'tests/playwright/steps/*.ts',
   outputDir: 'tests/playwright/.features-gen',
});

export default defineConfig({
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
   projects: [
      { name: 'storybook', testDir: './tests/playwright', testIgnore: '**/.features-gen/**' },
      { name: 'storybook-bdd', testDir: bddTestDir },
   ],
});
