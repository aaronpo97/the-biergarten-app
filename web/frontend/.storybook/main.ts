import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
    stories: [
        '../stories/Configure.mdx',
        '../stories/SubmitButton.stories.tsx',
        '../stories/FormField.stories.tsx',
        '../stories/SectionCard.stories.tsx',
        '../stories/UsernameSection.stories.tsx',
        '../stories/PasswordSection.stories.tsx',
        '../stories/LoginForm.stories.tsx',
        '../stories/RegisterForm.stories.tsx',
        '../stories/Navbar.stories.tsx',
        '../stories/Toast.stories.tsx',
        '../stories/Themes.stories.tsx',
    ],
    addons: [
        '@chromatic-com/storybook',
        '@storybook/addon-vitest',
        '@storybook/addon-a11y',
        '@storybook/addon-docs',
        '@storybook/addon-onboarding',
    ],
    framework: '@storybook/react-vite',
    async viteFinal(config) {
        config.plugins = (config.plugins ?? []).filter((plugin) => {
            if (!plugin) {
                return true;
            }

            const pluginName = typeof plugin === 'object' && 'name' in plugin ? plugin.name : '';
            return !pluginName.startsWith('react-router');
        });

        config.build ??= {};
        config.build.rollupOptions ??= {};

        const previousOnWarn = config.build.rollupOptions.onwarn;
        config.build.rollupOptions.onwarn = (warning, warn) => {
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
                return;
            }

            if (typeof previousOnWarn === 'function') {
                previousOnWarn(warning, warn);
                return;
            }

            warn(warning);
        };

        return config;
    },
};
export default config;
