import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { biergartenThemes } from "../app/lib/themes";

function ThemeSwatch({ label, className }: { label: string; className: string }) {
  return <div className={`rounded-box p-3 text-sm font-medium ${className}`}>{label}</div>;
}

function ThemePanel({ label, value, vibe }: { label: string; value: string; vibe: string }) {
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

        <div className="grid gap-2 sm:grid-cols-2">
          <ThemeSwatch label="Primary" className="bg-primary text-primary-content" />
          <ThemeSwatch label="Secondary" className="bg-secondary text-secondary-content" />
          <ThemeSwatch label="Accent" className="bg-accent text-accent-content" />
          <ThemeSwatch label="Neutral" className="bg-neutral text-neutral-content" />
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="btn btn-primary btn-sm">Primary</button>
          <button className="btn btn-secondary btn-sm">Secondary</button>
          <button className="btn btn-outline btn-sm">Outline</button>
        </div>

        <div role="alert" className="alert alert-info alert-soft">
          <span>Semantic tokens stay stable while the atmosphere changes.</span>
        </div>
      </div>
    </section>
  );
}

const meta = {
  title: "Themes/Biergarten Themes",
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
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
      await expect(canvas.getByRole("heading", { name: theme.label })).toBeInTheDocument();
    }
  },
};
