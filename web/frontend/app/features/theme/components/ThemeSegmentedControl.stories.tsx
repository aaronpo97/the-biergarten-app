import type { Meta, StoryObj } from '@storybook/react-vite';
import { useMemo } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { expect, fn, userEvent, within } from 'storybook/test';
import { biergartenThemes, defaultThemeName, themeCookieName, type ThemeName } from '../themes';
import ThemeSegmentedControl from './ThemeSegmentedControl';

const themeSegmentedControlDescription = `The shared theme picker, used by the theme guide and by the landing page's try-out band. Each option pairs a gradient swatch of the theme's palette with its name and \`shortVibe\` mood line, and selection is carried by both color and elevation. Picking an option sets \`data-theme\` on \`<html>\` and writes the \`${themeCookieName}\` cookie, so the choice survives the next request and the server renders the same theme. The initial selection comes from the root route's loader, so these stories run behind a memory data router whose \`root\` route supplies the theme the cookie would have provided.`;

interface HarnessProps {
    labels?: 'full' | 'short';
    className?: string;
    onChange?: (theme: ThemeName) => void;
    /** Theme the root loader hands the control, standing in for the theme cookie. */
    seedTheme?: ThemeName;
}

const ThemeSegmentedControlHarness = ({
    labels,
    className,
    onChange,
    seedTheme = defaultThemeName,
}: HarnessProps) => {
    // Rebuilt per arg change so the docs controls remount the control rather
    // than leaving it seeded from the previous render.
    const router = useMemo(
        () =>
            createMemoryRouter([
                {
                    id: 'root',
                    path: '/',
                    loader: () => ({ theme: seedTheme }),
                    element: (
                        <div className="max-w-md rounded-box bg-base-100 p-4 text-base-content">
                            <ThemeSegmentedControl
                                labels={labels}
                                className={className}
                                onChange={onChange}
                            />
                        </div>
                    ),
                },
            ]),
        [labels, className, onChange, seedTheme],
    );

    return <RouterProvider router={router} />;
};

const meta = {
    title: 'Themes/ThemeSegmentedControl',
    component: ThemeSegmentedControlHarness,
    tags: ['autodocs'],
    args: {
        labels: 'full',
        seedTheme: defaultThemeName,
        onChange: fn(),
    },
    argTypes: {
        labels: { control: 'inline-radio', options: ['full', 'short'] },
        seedTheme: {
            control: 'select',
            options: biergartenThemes.map((theme) => theme.value),
        },
    },
    parameters: {
        usesDataRouter: true,
        docs: {
            description: {
                component: themeSegmentedControlDescription,
            },
        },
    },
} satisfies Meta<typeof ThemeSegmentedControlHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

const getOptions = (canvasElement: HTMLElement) => {
    const group = within(canvasElement).getByRole('radiogroup', { name: 'Theme selector' });
    return { group, radios: within(group).getAllByRole('radio') as HTMLInputElement[] };
};

/** Full labels, as the theme guide renders it. */
export const Default: Story = {
    play: async ({ canvasElement }) => {
        const { group, radios } = getOptions(canvasElement);

        await expect(radios).toHaveLength(biergartenThemes.length);

        for (const theme of biergartenThemes) {
            await expect(within(group).getByText(theme.label)).toBeVisible();
            await expect(within(group).getByText(theme.shortVibe)).toBeVisible();
        }

        const [lager] = radios;
        await expect(lager.value).toBe(defaultThemeName);
        await expect(lager.checked).toBe(true);
    },
};

/** Short labels, as the landing page renders it in the narrower try-out card. */
export const ShortLabels: Story = {
    args: {
        labels: 'short',
    },
    play: async ({ canvasElement }) => {
        const { group } = getOptions(canvasElement);

        for (const theme of biergartenThemes) {
            await expect(within(group).getByText(theme.shortLabel)).toBeVisible();
            await expect(within(group).getByText(theme.shortVibe)).toBeVisible();
        }

        await expect(within(group).queryByText(biergartenThemes[0].label)).toBeNull();
    },
};

/** A returning visitor whose cookie already names a theme other than the default. */
export const SeededFromCookie: Story = {
    args: {
        seedTheme: 'biergarten-cassis',
    },
    play: async ({ canvasElement }) => {
        const { radios } = getOptions(canvasElement);

        for (const radio of radios) {
            await expect(radio.checked).toBe(radio.value === 'biergarten-cassis');
        }
    },
};

export const SelectingATheme: Story = {
    play: async ({ canvasElement, args }) => {
        const previousTheme = document.documentElement.getAttribute('data-theme');
        const { group, radios } = getOptions(canvasElement);

        await userEvent.click(within(group).getByText('Biergarten Stout'));

        for (const radio of radios) {
            await expect(radio.checked).toBe(radio.value === 'biergarten-stout');
        }

        await expect(args.onChange).toHaveBeenCalledWith('biergarten-stout');
        await expect(document.documentElement.getAttribute('data-theme')).toBe('biergarten-stout');
        await expect(document.cookie).toContain(`${themeCookieName}=biergarten-stout`);

        // The control themes the whole document, so hand <html> back to the
        // toolbar's theme before the next story mounts.
        if (previousTheme === null) {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', previousTheme);
        }
    },
};

/** Single column, for a sidebar or any container too narrow for the paired grid. */
export const SingleColumn: Story = {
    args: {
        className: 'grid grid-cols-1 gap-2',
    },
    play: async ({ canvasElement }) => {
        const { radios } = getOptions(canvasElement);
        await expect(radios).toHaveLength(biergartenThemes.length);
    },
};
