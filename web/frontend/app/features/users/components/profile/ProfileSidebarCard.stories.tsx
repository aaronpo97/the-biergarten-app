import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import ProfileSidebarCard from './ProfileSidebarCard';

const profileSidebarCardDescription = `Identity card in the public profile page's sidebar: name/handle, the Follow/Edit profile action, bio, location and join date, and the follower/following stat list.`;

const meta = {
    title: 'Users/ProfileSidebarCard',
    component: ProfileSidebarCard,
    tags: ['autodocs'],
    args: {
        displayName: 'Maren Iverson',
        username: 'mareniverson',
        bio: 'Homebrewer turned hop enthusiast. Chasing the best stout in the Midwest, one taproom at a time. 🍺',
        location: 'Portland, OR',
        joinedLabel: 'Joined March 2023',
        stats: [
            { label: 'Following', value: 68 },
            { label: 'Followers', value: 214 },
            { label: 'Breweries visited', value: 37 },
            { label: 'Ratings given', value: 112 },
        ],
        onToggleFollow: fn(),
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: profileSidebarCardDescription,
            },
        },
    },
} satisfies Meta<typeof ProfileSidebarCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Visitor: Story = {
    args: { isOwnProfile: false, isFollowing: false },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const followButton = canvas.getByRole('button', { name: /^follow$/i });
        await userEvent.click(followButton);
        await expect(args.onToggleFollow).toHaveBeenCalledTimes(1);
    },
};

export const FollowingVisitor: Story = {
    args: { isOwnProfile: false, isFollowing: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: /^following$/i })).toBeInTheDocument();
    },
};

export const OwnProfile: Story = {
    args: { isOwnProfile: true, isFollowing: false },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: /edit profile/i })).toBeInTheDocument();
    },
};
