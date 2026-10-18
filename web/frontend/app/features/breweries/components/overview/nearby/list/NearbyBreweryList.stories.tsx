import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { sampleBrewery } from '../sampleBrewery';
import type { BreweryWithDistance } from '../types';
import NearbyBreweryList from './NearbyBreweryList';

const nearbyBreweryListDescription = `List of nearby breweries sorted by the caller. When a search centre is set but nothing falls inside the radius it shows an empty message; with no centre it renders nothing.`;

const withDistance: BreweryWithDistance[] = [
    { brewery: sampleBrewery, distanceMetres: 4200 },
    {
        brewery: {
            ...sampleBrewery,
            breweryPostId: 'brewery-mid',
            breweryName: 'Midrange Malts',
            location: sampleBrewery.location && {
                ...sampleBrewery.location,
                cityName: 'Salem',
            },
        },
        distanceMetres: 76000,
    },
];

const meta = {
    title: 'Breweries/NearbyBreweryList',
    component: NearbyBreweryList,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: nearbyBreweryListDescription,
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="flex w-full max-w-sm flex-col gap-3">
                <Story />
            </div>
        ),
    ],
    args: {
        withDistance,
        center: [45.52, -122.68],
        radiusKm: 100,
        unit: 'km',
        selectedId: null,
        onSelect: fn(),
    },
} satisfies Meta<typeof NearbyBreweryList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('button')).toHaveLength(2);
    },
};

export const WithSelection: Story = {
    args: { selectedId: 'brewery-mid' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: /midrange malts/i })).toHaveClass(
            'border-primary',
        );
    },
};

export const EmptyWithinRadius: Story = {
    args: { withDistance: [] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText(/no partner breweries within 100 km/i)).toBeInTheDocument();
    },
};

export const NoSearchCentre: Story = {
    args: { withDistance: [], center: null },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByText(/no partner breweries/i)).not.toBeInTheDocument();
    },
};

export const SelectsBrewery: Story = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /midrange malts/i }));
        await expect(args.onSelect).toHaveBeenCalledWith('brewery-mid');
    },
};
