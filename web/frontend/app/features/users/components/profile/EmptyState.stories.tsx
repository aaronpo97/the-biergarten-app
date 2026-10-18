import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import EmptyState from './EmptyState';

const emptyStateDescription = `Placeholder card shown in a profile tab that has nothing to list yet, such as no activity, likes or followers.`;

const meta = {
    title: 'Users/EmptyState',
    component: EmptyState,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: emptyStateDescription,
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-md">
                <Story />
            </div>
        ),
    ],
    args: {
        message: 'No activity yet.',
    },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('No activity yet.')).toBeInTheDocument();
    },
};

export const LongMessage: Story = {
    args: {
        message:
            'This user has not liked any beers or breweries yet. Likes appear here once they start rating.',
    },
};
