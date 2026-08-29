import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { biergartenThemes } from './themes';

const themesDescription = `Palette reference for all Biergarten themes. Each panel shows the main semantic color pairs, status tokens, and custom content tokens so you can catch contrast issues, pairing mistakes, and mood drift before they show up in real components.`;

const ThemeSwatch = ({ label, className }: { label: string; className: string }) => {
    return <div className={`rounded-box p-3 text-sm font-medium ${className}`}>{label}</div>;
};

/** For custom tokens not covered by Tailwind utilities (surface, muted, highlight). */
const CssVarSwatch = ({ label, bg, color }: { label: string; bg: string; color: string }) => {
    return (
        <div
            className="rounded-box p-3 text-sm font-medium"
            style={{ backgroundColor: `var(${bg})`, color: `var(${color})` }}
        >
            {label}
        </div>
    );
};

const TextTokenSample = ({
    label,
    background,
    text,
}: {
    label: string;
    background: string;
    text: string;
}) => {
    return (
        <div className="rounded-box p-3" style={{ backgroundColor: `var(${background})` }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium" style={{ color: `var(${text})` }}>
                Secondary copy, placeholders, and helper text.
            </p>
        </div>
    );
};

const ThemePanel = ({ label, value, vibe }: { label: string; value: string; vibe: string }) => {
    return (
        <section
            data-theme={value}
            className="rounded-box border border-base-300 bg-base-100 shadow-lg"
        >
            <div className="space-y-4 p-5">
                <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{label}</h2>
                    <p className="text-sm text-base-content/70">{vibe}</p>
                </div>

                <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                        Core
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2">
                        <ThemeSwatch label="Primary" className="bg-primary text-primary-content" />
                        <ThemeSwatch
                            label="Secondary"
                            className="bg-secondary text-secondary-content"
                        />
                        <ThemeSwatch label="Accent" className="bg-accent text-accent-content" />
                        <ThemeSwatch label="Neutral" className="bg-neutral text-neutral-content" />
                    </div>
                </div>

                <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                        Status
                    </p>
                    <div className="grid gap-2 grid-cols-2 sm:grid-cols-4">
                        <ThemeSwatch label="Info" className="bg-info text-info-content" />
                        <ThemeSwatch label="Success" className="bg-success text-success-content" />
                        <ThemeSwatch label="Warning" className="bg-warning text-warning-content" />
                        <ThemeSwatch label="Error" className="bg-error text-error-content" />
                    </div>
                </div>

                <div>
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-base-content/50">
                        Content
                    </p>
                    <div className="grid gap-2 sm:grid-cols-3">
                        <CssVarSwatch
                            label="Surface"
                            bg="--color-surface"
                            color="--color-surface-content"
                        />
                        <TextTokenSample
                            label="Muted on Base"
                            background="--color-base-100"
                            text="--color-muted"
                        />
                        <CssVarSwatch
                            label="Highlight"
                            bg="--color-highlight"
                            color="--color-highlight-content"
                        />
                    </div>
                    <div className="mt-2">
                        <TextTokenSample
                            label="Muted on Surface"
                            background="--color-surface"
                            text="--color-muted"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button className="btn btn-primary btn-sm">Primary</button>
                    <button className="btn btn-secondary btn-sm">Secondary</button>
                    <button className="btn btn-outline btn-sm">Outline</button>
                </div>

                <div role="alert" className="alert alert-success alert-soft">
                    <span>Semantic tokens stay stable while the atmosphere changes.</span>
                </div>
            </div>
        </section>
    );
};

const meta = {
    title: 'Themes/Biergarten Themes',
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: themesDescription,
            },
        },
    },
    tags: ['autodocs'],
    render: () => (
        <div className="grid gap-6 p-6 lg:grid-cols-2">
            {biergartenThemes.map((theme) => (
                <ThemePanel key={theme.value} {...theme} />
            ))}
        </div>
    ),
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Gallery: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        for (const theme of biergartenThemes) {
            await expect(canvas.getByRole('heading', { name: theme.label })).toBeInTheDocument();
        }
    },
};
