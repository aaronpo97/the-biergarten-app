import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import LocationCard from '../app/features/breweries/components/detail/LocationCard';
import type { BreweryLocation } from '../app/features/breweries/breweries.server';

const locationCardDescription = `Sidebar "Location" card: an interactive single-pin map (when coordinates are available), address, and website link. Smoke-render only for the map portion - this hits the real OpenStreetMap tile server in the browser test run.`;

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

const meta = {
    title: 'Breweries/LocationCard',
    component: LocationCard,
    tags: ['autodocs'],
    args: {
        breweryName: 'Cascade Hollow Brewing',
        website: 'cascadehollow.example',
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: locationCardDescription,
            },
        },
    },
} satisfies Meta<typeof LocationCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithCoordinates: Story = {
    args: { location: portlandLocation },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Location')).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: 'cascadehollow.example' })).toHaveAttribute(
            'href',
            'https://cascadehollow.example',
        );
    },
};

export const WithoutCoordinates: Story = {
    args: { location: { ...portlandLocation, coordinates: null } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByText('123 Hop Street, Portland, OR 97201, United States'),
        ).toBeInTheDocument();
    },
};
