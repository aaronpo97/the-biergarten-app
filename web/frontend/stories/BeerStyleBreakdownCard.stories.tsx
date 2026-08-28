import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import BeerStyleBreakdownCard from '../app/features/breweries/components/BeerStyleBreakdownCard';
import { FILLER_BEERS } from '../app/features/breweries/utils/filler-brewery-detail';

const beerStyleBreakdownCardDescription = `Sidebar "Beer styles" card: per-style progress bars, sorted by count descending, derived client-side from a brewery's beer list.`;

const meta = {
    title: 'Breweries/BeerStyleBreakdownCard',
    component: BeerStyleBreakdownCard,
    tags: ['autodocs'],
    args: {
        beers: FILLER_BEERS,
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: beerStyleBreakdownCardDescription,
            },
        },
    },
} satisfies Meta<typeof BeerStyleBreakdownCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Beer styles')).toBeInTheDocument();
        await expect(canvas.getByText('IPA')).toBeInTheDocument();
        await expect(canvas.getByText('Sour')).toBeInTheDocument();
    },
};

export const SingleStyle: Story = {
    args: {
        beers: FILLER_BEERS.filter((beer) => beer.style === 'IPA'),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('IPA')).toBeInTheDocument();
        await expect(canvas.queryByText('Sour')).not.toBeInTheDocument();
    },
};
