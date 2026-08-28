import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import BreweryHeaderCard from '../app/features/breweries/components/BreweryHeaderCard';
import type { Brewery, BreweryLocation } from '../app/features/breweries/breweries.server';

const breweryHeaderCardDescription = `Top card on the brewery detail page: eyebrow + "Est." badge, name, address, like button, average rating, and description. Founded year and average rating are currently filler pending backend support — see BREWERY_HANDOFF.md.`;

const portlandLocation: BreweryLocation = {
    breweryPostLocationId: 'loc-1',
    breweryPostId: 'brewery-1',
    cityId: 'city-1',
    cityName: 'Portland',
    stateProvinceName: 'Oregon',
    stateProvinceCode: 'OR',
    countryName: 'United States',
    countryCode: 'US',
    addressLine1: '123 Hop Street',
    addressLine2: null,
    postalCode: '97201',
    coordinates: { latitude: 45.5152, longitude: -122.6784 },
};

const brewery: Brewery = {
    breweryPostId: 'brewery-1',
    postedById: 'user-1',
    breweryName: 'Cascade Hollow Brewing',
    description:
        'A small-batch brewery known for hazy IPAs and barrel-aged sours, tucked into an old warehouse district.',
    createdAt: '2024-03-01T12:00:00.000Z',
    updatedAt: null,
    location: portlandLocation,
};

const meta = {
    title: 'Breweries/BreweryHeaderCard',
    component: BreweryHeaderCard,
    tags: ['autodocs'],
    args: {
        brewery,
        foundedYear: 2014,
        avgRating: 4,
        ratingsCount: 76,
        onToggleLike: fn(),
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: breweryHeaderCardDescription,
            },
        },
    },
} satisfies Meta<typeof BreweryHeaderCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unliked: Story = {
    args: { liked: false, likeCount: 127 },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('heading', { name: 'Cascade Hollow Brewing', level: 1 }),
        ).toBeInTheDocument();
        const likeButton = canvas.getByRole('button', { name: /like · 127/i });
        await userEvent.click(likeButton);
        await expect(args.onToggleLike).toHaveBeenCalledOnce();
    },
};

export const Liked: Story = {
    args: { liked: true, likeCount: 128 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: /liked · 128/i })).toBeInTheDocument();
    },
};
