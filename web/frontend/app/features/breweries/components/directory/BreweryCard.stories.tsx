import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import BreweryCard from './BreweryCard';
import type { Brewery, BreweryLocation } from '../../breweries.server';
import { formatBreweryAddress } from '../../utils/format-address';

const breweryCardDescription = `Link-card for a brewery shown in listing grids. These stories cover a brewery with a full mapped location, one whose location has no coordinates (no "View on map" link), and one with no location at all.`;

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
    title: 'Breweries/BreweryCard',
    component: BreweryCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: breweryCardDescription,
            },
        },
    },
} satisfies Meta<typeof BreweryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithLocation: Story = {
    args: { brewery: breweryWithLocation },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('heading', { name: 'Cascade Hollow Brewing' }),
        ).toBeInTheDocument();
        await expect(canvas.getByText('Portland, OR')).toBeInTheDocument();
        await expect(canvas.getByText(formatBreweryAddress(portlandLocation))).toBeInTheDocument();

        const cardLink = canvas.getByRole('link', { name: /cascade hollow brewing/i });
        await expect(cardLink).toHaveAttribute('href', '/breweries/brewery-1');

        const mapLink = canvas.getByRole('link', { name: 'View on map →' });
        await expect(mapLink).toHaveAttribute('href', expect.stringContaining('mlat=45.5152'));
        await expect(mapLink).toHaveAttribute('target', '_blank');
    },
};

export const WithoutCoordinates: Story = {
    args: { brewery: breweryWithoutCoordinates },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Portland, OR')).toBeInTheDocument();
        await expect(canvas.queryByRole('link', { name: /view on map/i })).not.toBeInTheDocument();
    },
};

export const WithoutLocation: Story = {
    args: { brewery: breweryWithoutLocation },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: 'Unmapped Ales' })).toBeInTheDocument();
        await expect(canvas.queryByText('Portland, OR')).not.toBeInTheDocument();
        await expect(canvas.queryByRole('link', { name: /view on map/i })).not.toBeInTheDocument();
    },
};
