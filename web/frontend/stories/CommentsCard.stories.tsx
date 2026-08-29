import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import CommentsCard from '../app/features/breweries/components/detail/comments/CommentsCard';
import { FILLER_COMMENTS } from '../app/features/breweries/utils/filler-brewery-detail';

const commentsCardDescription = `Comments section on the brewery detail page: a post form (logged in) or a sign-in alert (logged out), followed by the comment list. Posting is disabled until the textarea has non-whitespace content.`;

const meta = {
    title: 'Breweries/CommentsCard',
    component: CommentsCard,
    tags: ['autodocs'],
    args: {
        comments: FILLER_COMMENTS,
        currentUserInitials: 'JD',
        onAddComment: fn(),
        onToggleCommentLike: fn(),
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: commentsCardDescription,
            },
        },
    },
} satisfies Meta<typeof CommentsCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LoggedIn: Story = {
    args: { loggedIn: true },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        const postButton = canvas.getByRole('button', { name: /post comment/i });
        await expect(postButton).toBeDisabled();

        await userEvent.type(
            canvas.getByPlaceholderText('Share your thoughts on this brewery'),
            'Great taproom!',
        );
        await expect(postButton).toBeEnabled();
        await userEvent.click(postButton);
        await expect(args.onAddComment).toHaveBeenCalledWith('Great taproom!');
    },
};

export const LoggedOut: Story = {
    args: { loggedIn: false },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByText('Sign in to like, rate, and comment on breweries.'),
        ).toBeInTheDocument();
        await expect(
            canvas.queryByPlaceholderText('Share your thoughts on this brewery'),
        ).not.toBeInTheDocument();
    },
};
