import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, within } from 'storybook/test';
import { biergartenThemes, defaultThemeName } from '../../theme/themes';
import ThemeTryOut from './ThemeTryOut';

const themeTryOutDescription = `Landing page theme band. Hosts the shared \`ThemeSegmentedControl\` with short labels, so a visitor can switch the whole document theme from the marketing page. The control seeds its selection from the root route's loader data, so this story runs behind a memory data router whose \`root\` route supplies a theme.`;

const ThemeTryOutHarness = () => {
    const [router] = useState(() =>
        createMemoryRouter([
            {
                id: 'root',
                path: '/',
                loader: () => ({ theme: defaultThemeName }),
                element: <ThemeTryOut />,
            },
        ]),
    );

    return <RouterProvider router={router} />;
};

const meta = {
    title: 'Home/ThemeTryOut',
    component: ThemeTryOutHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        usesDataRouter: true,
        docs: {
            description: {
                component: themeTryOutDescription,
            },
        },
    },
} satisfies Meta<typeof ThemeTryOutHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            canvas.getByRole('heading', { name: 'Pick a pour that suits you' }),
        ).toBeInTheDocument();

        const group = canvas.getByRole('radiogroup', { name: 'Theme selector' });
        for (const theme of biergartenThemes) {
            await expect(within(group).getByText(theme.shortLabel)).toBeInTheDocument();
        }
    },
};
