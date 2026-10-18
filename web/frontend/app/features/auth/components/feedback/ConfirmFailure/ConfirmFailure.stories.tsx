import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ConfirmFailure from './ConfirmFailure';

const confirmFailureDescription = `Outcome card shown when an email confirmation link is invalid, expired or already used. It shows the server error and a link back to the dashboard.`;

const meta = {
    title: 'Auth/ConfirmFailure',
    component: ConfirmFailure,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: confirmFailureDescription,
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="card w-full max-w-md bg-base-100 shadow-lg">
                <div className="card-body items-center gap-3 text-center">
                    <Story />
                </div>
            </div>
        ),
    ],
    args: {
        error: 'The confirmation token is invalid.',
    },
} satisfies Meta<typeof ConfirmFailure>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('heading', { name: /confirmation failed/i }),
        ).toBeInTheDocument();
        await expect(canvas.getByRole('alert')).toHaveTextContent(/token is invalid/i);
        await expect(canvas.getByRole('link', { name: /back to dashboard/i })).toHaveAttribute(
            'href',
            '/dashboard',
        );
    },
};
