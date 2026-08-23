import type { Preview } from '@storybook/react-vite';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router';
import '../app/app.css';
import {
    biergartenThemes,
    defaultThemeName,
    isBiergartenTheme,
} from '../app/features/theme/themes';

const preview: Preview = {
    globalTypes: {
        theme: {
            description: 'Active Biergarten theme',
            toolbar: {
                title: 'Theme',
                icon: 'paintbrush',
                dynamicTitle: true,
                items: biergartenThemes.map((theme) => ({
                    value: theme.value,
                    title: theme.label,
                })),
            },
        },
    },
    initialGlobals: {
        theme: defaultThemeName,
    },
    decorators: [
        (Story, context) => {
            const theme = isBiergartenTheme(String(context.globals.theme))
                ? context.globals.theme
                : defaultThemeName;

            return createElement(
                MemoryRouter,
                undefined,
                createElement(
                    'div',
                    {
                        'data-theme': theme,
                        className: 'bg-base-200 p-6 text-base-content',
                    },
                    createElement('div', { className: 'mx-auto max-w-7xl' }, createElement(Story)),
                ),
            );
        },
    ],
    parameters: {
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i,
            },
        },
        layout: 'padded',

        a11y: {
            // 'todo' - show a11y violations in the test UI only
            // 'error' - fail CI on a11y violations
            // 'off' - skip a11y checks entirely
            test: 'todo',
        },
    },
};

export default preview;
