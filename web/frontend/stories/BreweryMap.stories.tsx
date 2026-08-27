import type { Meta, StoryObj } from '@storybook/react-vite';
import BreweryMap, { type BreweryMapPin } from '../app/features/breweries/components/BreweryMap';
import type { BreweryLocation } from '../app/features/breweries/breweries.server';

const breweryMapDescription = `Leaflet map plotting brewery locations, with an optional current-location marker. Smoke-render only - this hits the real OpenStreetMap tile server in the browser test run, and its \`navigator.geolocation\` call is tolerated whether or not it succeeds.`;

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

const pins: BreweryMapPin[] = [
    {
        id: 'brewery-1',
        name: 'Cascade Hollow Brewing',
        latitude: 45.5152,
        longitude: -122.6784,
        location: portlandLocation,
    },
    {
        id: 'brewery-2',
        name: 'Foggy Bottom Brewhouse',
        latitude: 44.06,
        longitude: -121.31,
        location: null,
    },
];

const meta = {
    title: 'Breweries/BreweryMap',
    component: BreweryMap,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: breweryMapDescription,
            },
        },
    },
} satisfies Meta<typeof BreweryMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: { breweries: pins },
};

export const NoBreweries: Story = {
    args: { breweries: [] },
};
