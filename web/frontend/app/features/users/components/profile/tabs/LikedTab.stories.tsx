import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import LikedTab from './LikedTab';
import { FILLER_LIKED } from '../../../utils/filler-user-profile';

const likedTabDescription = `A profile's Liked tab: a 2-column grid of beers this user has liked, each with a rating.`;

const meta = {
    title: 'Users/LikedTab',
    component: LikedTab,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: likedTabDescription,
            },
        },
    },
} satisfies Meta<typeof LikedTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
    args: { liked: FILLER_LIKED },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Interurban IPA')).toBeInTheDocument();
        await expect(canvas.getByText('Fremont Brewing')).toBeInTheDocument();
    },
};

export const Empty: Story = {
    args: { liked: [] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('No likes yet.')).toBeInTheDocument();
    },
};
