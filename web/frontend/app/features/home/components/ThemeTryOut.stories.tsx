import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, within } from 'storybook/test';
import { biergartenThemes, defaultThemeName } from '../../theme/themes';
import ThemeTryOut from './ThemeTryOut';

const themeTryOutDescription = `Landing page theme band. Frames the shared \`ThemeSegmentedControl\` in an elevated card with a "Set the mood" eyebrow and a pour count, and renders it with short labels so the four options fit the marketing page's narrower column. Each option carries its \`shortVibe\` mood line, and picking one switches the whole document theme. The control seeds its selection from the root route's loader data, so this story runs behind a memory data router whose \`root\` route supplies a theme. \`Themes/ThemeSegmentedControl\` covers the control itself.`;

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

        await expect(canvas.getByText('Set the mood')).toBeVisible();
        await expect(canvas.getByText(`${biergartenThemes.length} pours`)).toBeVisible();

        const group = canvas.getByRole('radiogroup', { name: 'Theme selector' });
        await expect(within(group).getAllByRole('radio')).toHaveLength(biergartenThemes.length);

        for (const theme of biergartenThemes) {
            await expect(within(group).getByText(theme.shortLabel)).toBeVisible();
            await expect(within(group).getByText(theme.shortVibe)).toBeVisible();
        }
    },
};
