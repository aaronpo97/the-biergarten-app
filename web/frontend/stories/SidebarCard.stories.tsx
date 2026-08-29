import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import SidebarCard from '../app/features/breweries/components/shared/SidebarCard';

const sidebarCardDescription = `Shared card shell used by the brewery detail page's sidebar sections (Location, Details, Beer styles, Community) — an uppercase eyebrow label over arbitrary content.`;

const meta = {
    title: 'Breweries/SidebarCard',
    component: SidebarCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: sidebarCardDescription,
            },
        },
    },
} satisfies Meta<typeof SidebarCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    args: {
        title: 'Details',
        children: <p className="text-sm m-0">Founded 2014</p>,
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Details')).toBeInTheDocument();
        await expect(canvas.getByText('Founded 2014')).toBeInTheDocument();
    },
};
