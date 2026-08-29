import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import CommunityStatsCard from '../app/features/breweries/components/detail/CommunityStatsCard';

const communityStatsCardDescription = `Sidebar "Community" card: live likes/ratings/comments counts, kept in sync with the header, your-rating, and comments cards on the brewery detail page.`;

const meta = {
    title: 'Breweries/CommunityStatsCard',
    component: CommunityStatsCard,
    tags: ['autodocs'],
    args: {
        likeCount: 127,
        ratingsCount: 76,
        commentCount: 3,
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: communityStatsCardDescription,
            },
        },
    },
} satisfies Meta<typeof CommunityStatsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Likes')).toBeInTheDocument();
        await expect(canvas.getByText('127')).toBeInTheDocument();
        await expect(canvas.getByText('76')).toBeInTheDocument();
        await expect(canvas.getByText('3')).toBeInTheDocument();
    },
};
