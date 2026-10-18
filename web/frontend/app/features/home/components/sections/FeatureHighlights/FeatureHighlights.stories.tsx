import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import FeatureHighlights from './FeatureHighlights';

const featureHighlightsDescription = `Landing page feature band: three icon-led product capabilities on a base-100 strip.`;

const meta = {
    title: 'Home/FeatureHighlights',
    component: FeatureHighlights,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: featureHighlightsDescription,
            },
        },
    },
} satisfies Meta<typeof FeatureHighlights>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            canvas.getByRole('heading', { name: 'Everything you need to plan the next round' }),
        ).toBeInTheDocument();

        for (const title of ['Browse breweries', 'Explore the beers', 'Keep a record']) {
            await expect(canvas.getByRole('heading', { name: title })).toBeInTheDocument();
        }
    },
};
