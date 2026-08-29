import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import CommentItem from '../app/features/breweries/components/detail/comments/CommentItem';
import type { FillerComment } from '../app/features/breweries/utils/filler-brewery-detail';

const commentItemDescription = `A single comment row on the brewery detail page: avatar initials, username/star/timestamp, body, and a per-comment like toggle.`;

const comment: FillerComment = {
    id: '1',
    user: 'malt_kettle',
    initials: 'MK',
    rating: 5,
    time: '2 days ago',
    text: 'The barrel-aged flanders red is worth the trip alone.',
    likes: 12,
    liked: false,
};

const meta = {
    title: 'Breweries/CommentItem',
    component: CommentItem,
    tags: ['autodocs'],
    args: {
        onToggleLike: fn(),
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: commentItemDescription,
            },
        },
    },
} satisfies Meta<typeof CommentItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unliked: Story = {
    args: { comment },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('malt_kettle')).toBeInTheDocument();
        const likeButton = canvas.getByRole('button', { name: /12 likes/i });
        await userEvent.click(likeButton);
        await expect(args.onToggleLike).toHaveBeenCalledWith('1');
    },
};

export const Liked: Story = {
    args: { comment: { ...comment, liked: true } },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: /13 likes/i })).toBeInTheDocument();
    },
};
