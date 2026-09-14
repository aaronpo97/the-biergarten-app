import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import FollowingTab from './FollowingTab';
import { FILLER_FOLLOWING } from '../../../utils/filler-user-profile';

const followingTabDescription = `A profile's Following tab: the people and breweries this user follows, each with an unfollow toggle.`;

const meta = {
    title: 'Users/FollowingTab',
    component: FollowingTab,
    tags: ['autodocs'],
    args: {
        onToggleFollow: fn(),
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: followingTabDescription,
            },
        },
    },
} satisfies Meta<typeof FollowingTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
    args: {
        following: FILLER_FOLLOWING.map((f) => ({ ...f, isFollowing: true })),
    },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getAllByRole('button', { name: /^following$/i })[0];
        await userEvent.click(button);
        await expect(args.onToggleFollow).toHaveBeenCalledWith(FILLER_FOLLOWING[0].id);
    },
};

export const Empty: Story = {
    args: { following: [] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Not following anyone yet.')).toBeInTheDocument();
    },
};
