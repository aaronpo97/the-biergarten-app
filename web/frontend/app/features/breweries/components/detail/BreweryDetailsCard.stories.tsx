import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import BreweryDetailsCard from './BreweryDetailsCard';

const breweryDetailsCardDescription = `Sidebar "Details" card on the brewery detail page: founded year, brewery type, and beer count. Founded year and type are currently filler pending backend support — see BREWERY_HANDOFF.md.`;

const meta = {
    title: 'Breweries/BreweryDetailsCard',
    component: BreweryDetailsCard,
    tags: ['autodocs'],
    args: {
        foundedYear: 2014,
        type: 'Microbrewery',
        beerCount: 9,
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: breweryDetailsCardDescription,
            },
        },
    },
} satisfies Meta<typeof BreweryDetailsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Founded')).toBeInTheDocument();
        await expect(canvas.getByText('2014')).toBeInTheDocument();
        await expect(canvas.getByText('Microbrewery')).toBeInTheDocument();
        await expect(canvas.getByText('9')).toBeInTheDocument();
    },
};
