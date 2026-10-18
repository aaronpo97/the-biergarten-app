import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import AuthErrorAlert from './AuthErrorAlert';

const authErrorAlertDescription = `Error summary shown above the login and register forms. It always renders a \`role="alert"\` message and optionally lists per-field details beneath it.`;

const meta = {
    title: 'Auth/AuthErrorAlert',
    component: AuthErrorAlert,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: authErrorAlertDescription,
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
        message: 'Invalid username or password.',
    },
} satisfies Meta<typeof AuthErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MessageOnly: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('alert')).toHaveTextContent(/invalid username or password/i);
        await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
    },
};

export const WithDetails: Story = {
    args: {
        message: 'Please fix the following:',
        details: ['Username must be at least 3 characters', 'Password must contain a number'],
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    },
};

export const EmptyDetails: Story = {
    args: { details: [] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('list')).not.toBeInTheDocument();
    },
};
