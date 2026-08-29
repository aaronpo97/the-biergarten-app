import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import RecentBreweries from '../app/features/breweries/components/overview/RecentBreweries';
import type { Brewery, BreweryLocation } from '../app/features/breweries/breweries.server';

const recentBreweriesDescription = `Grid of recently-added breweries shown on the breweries index page. Renders nothing when the list is empty.`;

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

const cascadeHollow: Brewery = {
    breweryPostId: 'brewery-1',
    postedById: 'user-1',
    breweryName: 'Cascade Hollow Brewing',
    description: 'A small-batch brewery known for hazy IPAs and barrel-aged sours.',
    createdAt: '2024-03-01T12:00:00.000Z',
    updatedAt: null,
    location: portlandLocation,
};

const midrangeMalts: Brewery = {
    breweryPostId: 'brewery-2',
    postedById: 'user-2',
    breweryName: 'Midrange Malts',
    description: 'A neighborhood taproom pouring approachable session ales year-round.',
    createdAt: '2024-04-15T09:30:00.000Z',
    updatedAt: null,
    location: { ...portlandLocation, breweryPostId: 'brewery-2', cityName: 'Salem' },
};

const unmappedAles: Brewery = {
    breweryPostId: 'brewery-3',
    postedById: 'user-3',
    breweryName: 'Unmapped Ales',
    description: 'A pop-up brewery that hasn’t added a storefront location yet.',
    createdAt: '2024-05-02T18:00:00.000Z',
    updatedAt: null,
    location: null,
};

const meta = {
    title: 'Breweries/RecentBreweries',
    component: RecentBreweries,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: recentBreweriesDescription,
            },
        },
    },
} satisfies Meta<typeof RecentBreweries>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithBreweries: Story = {
    args: { breweries: [cascadeHollow, midrangeMalts, unmappedAles] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Recently added' })).toBeInTheDocument();
        await expect(
            canvas.getByRole('heading', { name: 'Cascade Hollow Brewing' }),
        ).toBeInTheDocument();

        const links = canvas.getAllByRole('link', { name: /view brewery/i });
        await expect(links).toHaveLength(3);
        await expect(links[0]).toHaveAttribute('href', '/breweries/brewery-1');
    },
};

export const Empty: Story = {
    args: { breweries: [] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.queryByRole('heading', { name: 'Recently added' }),
        ).not.toBeInTheDocument();
    },
};
