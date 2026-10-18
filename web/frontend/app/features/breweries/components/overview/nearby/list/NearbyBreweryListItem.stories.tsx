import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { sampleBrewery } from '../sampleBrewery';
import NearbyBreweryListItem from './NearbyBreweryListItem';

const nearbyBreweryListItemDescription = `Selectable card for one brewery in the nearby list. It shows the name, the distance in the chosen unit and the city, and highlights itself when its pin is selected on the map.`;

const meta = {
    title: 'Breweries/NearbyBreweryListItem',
    component: NearbyBreweryListItem,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: nearbyBreweryListItemDescription,
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-sm">
                <Story />
            </div>
        ),
    ],
    args: {
        brewery: sampleBrewery,
        distanceMetres: 4200,
        unit: 'km',
        selected: false,
        onSelect: fn(),
    },
} satisfies Meta<typeof NearbyBreweryListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Close Quarters Brewing')).toBeInTheDocument();
        await expect(canvas.getByText('4.2 km')).toBeInTheDocument();
        await expect(canvas.getByText('Portland, OR')).toBeInTheDocument();
    },
};

export const Selected: Story = {
    args: { selected: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button')).toHaveClass('border-primary');
    },
};

export const Miles: Story = {
    args: { unit: 'mi', distanceMetres: 8047 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('5.0 mi')).toBeInTheDocument();
    },
};

export const WithoutLocation: Story = {
    args: { brewery: { ...sampleBrewery, location: null } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByText('Portland, OR')).not.toBeInTheDocument();
    },
};

export const CallsOnSelect: Story = {
    play: async ({ canvasElement, args }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button'));
        await expect(args.onSelect).toHaveBeenCalledWith('brewery-close');
    },
};
