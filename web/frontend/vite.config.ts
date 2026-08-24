/// <reference types="vitest/config" />
import { reactRouter } from '@react-router/dev/vite';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
const dirname =
    typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const isStorybook =
    process.env.STORYBOOK === 'true' || process.argv.some((arg) => arg.includes('storybook'));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
    plugins: isStorybook ? [] : [reactRouter()],
    resolve: {
        dedupe: ['react', 'react-dom'],
    },
    test: {
        projects: [
            {
                extends: true,
                plugins: [
                    // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
                    storybookTest({
                        configDir: path.join(dirname, '.storybook'),
                    }),
                ],
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        instances: [
                            {
                                browser: 'chromium',
                            },
                        ],
                    },
                    setupFiles: ['.storybook/vitest.setup.ts'],
                },
            },
        ],
    },
});
