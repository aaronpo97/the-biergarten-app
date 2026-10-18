import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ConfirmSuccess from './ConfirmSuccess';

const confirmSuccessDescription = `Outcome card shown after a user follows a valid email confirmation link. It shows the confirmation time and a link to the dashboard.`;

const meta = {
    title: 'Auth/ConfirmSuccess',
    component: ConfirmSuccess,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: confirmSuccessDescription,
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
        confirmedDate: '2026-03-14T09:30:00Z',
    },
} satisfies Meta<typeof ConfirmSuccess>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('heading', { name: /email confirmed/i })).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: /go to dashboard/i })).toHaveAttribute(
            'href',
            '/dashboard',
        );
    },
};
