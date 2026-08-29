import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import FeaturedBreweryCard from '../app/features/breweries/components/overview/FeaturedBreweryCard';
import type { Brewery, BreweryLocation } from '../app/features/breweries/breweries.server';

const featuredBreweryCardDescription = `Larger "featured brewery" card shown above the fold on the breweries page. These stories cover a brewery with mappable coordinates (the "Show on map" button is present and wired to \`onShowOnMap\`), one with a location but no coordinates, and one with no location at all.`;

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

const breweryWithLocation: Brewery = {
    breweryPostId: 'brewery-1',
    postedById: 'user-1',
    breweryName: 'Cascade Hollow Brewing',
    description:
        'A small-batch brewery known for hazy IPAs and barrel-aged sours, tucked into an old warehouse district.',
    createdAt: '2024-03-01T12:00:00.000Z',
    updatedAt: null,
    location: portlandLocation,
};

const breweryWithoutCoordinates: Brewery = {
    ...breweryWithLocation,
    breweryPostId: 'brewery-2',
    breweryName: 'Foggy Bottom Brewhouse',
    location: { ...portlandLocation, coordinates: null },
};

const breweryWithoutLocation: Brewery = {
    ...breweryWithLocation,
    breweryPostId: 'brewery-3',
    breweryName: 'Unmapped Ales',
    location: null,
};

const meta = {
    title: 'Breweries/FeaturedBreweryCard',
    component: FeaturedBreweryCard,
    tags: ['autodocs'],
    args: {
        onShowOnMap: fn(),
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: featuredBreweryCardDescription,
            },
        },
    },
} satisfies Meta<typeof FeaturedBreweryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCoordinates: Story = {
    args: { brewery: breweryWithLocation },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('heading', { name: 'Cascade Hollow Brewing', level: 3 }),
        ).toBeInTheDocument();
        await expect(canvas.getByText('Founded')).toBeInTheDocument();
        await expect(canvas.getByText('2014')).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: /view brewery/i })).toHaveAttribute(
            'href',
            '/breweries/brewery-1',
        );

        await userEvent.click(canvas.getByRole('button', { name: /show on map/i }));
        await expect(args.onShowOnMap).toHaveBeenCalledOnce();
    },
};

export const WithoutCoordinates: Story = {
    args: { brewery: breweryWithoutCoordinates },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.queryByRole('button', { name: /show on map/i }),
        ).not.toBeInTheDocument();
    },
};

export const WithoutLocation: Story = {
    args: { brewery: breweryWithoutLocation },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Unmapped Ales' })).toBeInTheDocument();
        await expect(
            canvas.queryByRole('button', { name: /show on map/i }),
        ).not.toBeInTheDocument();
    },
};
