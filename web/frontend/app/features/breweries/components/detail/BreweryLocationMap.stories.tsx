import type { Meta, StoryObj } from '@storybook/react-vite';
import BreweryLocationMap from './BreweryLocationMap';

const breweryLocationMapDescription = `Small fixed single-pin Leaflet map used by the brewery detail page's Location sidebar card. Smoke-render only - this hits the real OpenStreetMap tile server in the browser test run.`;

const meta = {
    title: 'Breweries/BreweryLocationMap',
    component: BreweryLocationMap,
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: breweryLocationMapDescription,
            },
        },
    },
} satisfies Meta<typeof BreweryLocationMap>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        latitude: 45.5152,
        longitude: -122.6784,
        label: 'Cascade Hollow Brewing — 123 Hop Street',
    },
};
