import type { Meta, StoryObj } from '@storybook/react-vite';
import NearbyBreweryMap, {
    type NearbyMapPin,
} from '../app/features/breweries/components/NearbyBreweryMap';

const nearbyBreweryMapDescription = `Leaflet map of nearby-brewery pins used inside NearbyBreweriesSection. Smoke-render only - this hits the real OpenStreetMap tile server in the browser test run. Wrapped in a fixed-height container here since its \`h-full\` class normally relies on a CSS grid ancestor that this story doesn't provide.`;

const pins: NearbyMapPin[] = [
    {
        id: 'brewery-close',
        name: 'Close Quarters Brewing',
        cityLabel: 'Portland, OR',
        latitude: 45.52,
        longitude: -122.68,
    },
    {
        id: 'brewery-mid',
        name: 'Midrange Malts',
        cityLabel: 'Salem, OR',
        latitude: 44.94,
        longitude: -123.03,
    },
];

const meta = {
    title: 'Breweries/NearbyBreweryMap',
    component: NearbyBreweryMap,
    decorators: [
        (Story) => (
            <div className="h-[32rem]">
                <Story />
            </div>
        ),
    ],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: nearbyBreweryMapDescription,
            },
        },
    },
} satisfies Meta<typeof NearbyBreweryMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        pins,
        selectedId: null,
        onSelect: () => undefined,
        userLocation: [45.5152, -122.6784],
        userLocationLabel: 'your location',
    },
};

export const WithoutUserLocation: Story = {
    args: {
        pins,
        selectedId: null,
        onSelect: () => undefined,
        userLocation: null,
        userLocationLabel: 'your location',
    },
};
