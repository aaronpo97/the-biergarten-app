import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import BeerListCard from '../app/features/breweries/components/BeerListCard';
import { FILLER_BEERS } from '../app/features/breweries/utils/filler-brewery-detail';

const beerListCardDescription = `A brewery's beer list on the detail page: name/description, style badge, ABV, and star rating per row. Currently filler pending a beers-by-brewery endpoint — see BREWERY_DETAIL_HANDOFF.md.`;

const meta = {
    title: 'Breweries/BeerListCard',
    component: BeerListCard,
    tags: ['autodocs'],
    args: {
        beers: FILLER_BEERS,
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: beerListCardDescription,
            },
        },
    },
} satisfies Meta<typeof BeerListCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Beers (9)' })).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: /view all beers/i })).toHaveAttribute(
            'href',
            '/beers',
        );
        await expect(canvas.getByText('Switchyard IPA')).toBeInTheDocument();
        await expect(canvas.getByText('6.8% ABV')).toBeInTheDocument();
    },
};

export const SingleBeer: Story = {
    args: { beers: FILLER_BEERS.slice(0, 1) },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Beers (1)' })).toBeInTheDocument();
    },
};
