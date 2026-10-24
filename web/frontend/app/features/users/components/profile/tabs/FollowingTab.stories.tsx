import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import FollowingTab, { type FollowingEntry } from './FollowingTab';

const followingTabDescription = `A profile's Following tab: the people this user follows, each linking to their profile. On the viewer's own profile every row also carries an unfollow button.`;

const FOLLOWING: FollowingEntry[] = [
    {
        userAccountId: '11111111-1111-4111-8111-111111111111',
        name: 'Jonah Weckstein',
        username: 'jweck',
        avatarUrl: '',
    },
    {
        userAccountId: '22222222-2222-4222-8222-222222222222',
        name: 'Casey Blume',
        username: 'caseyb',
        avatarUrl: '',
    },
];

const meta = {
    title: 'Users/FollowingTab',
    component: FollowingTab,
    tags: ['autodocs'],
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
    args: { following: FOLLOWING },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Jonah Weckstein' })).toHaveAttribute(
            'href',
            `/users/${FOLLOWING[0].userAccountId}`,
        );
        await expect(canvas.queryByRole('button')).not.toBeInTheDocument();
    },
};

export const OwnProfile: Story = {
    args: { following: FOLLOWING, onUnfollow: fn() },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const button = canvas.getAllByRole('button', { name: /^following$/i })[0];
        await userEvent.click(button);
        await expect(args.onUnfollow).toHaveBeenCalledWith(FOLLOWING[0].userAccountId);
    },
};

export const Empty: Story = {
    args: { following: [] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Not following anyone yet.')).toBeInTheDocument();
    },
};
