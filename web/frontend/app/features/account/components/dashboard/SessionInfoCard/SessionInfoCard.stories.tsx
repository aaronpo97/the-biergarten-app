import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import SessionInfoCard from './SessionInfoCard';

const sessionInfoCardDescription = `Dashboard card greeting the signed-in user. It lists the username and account ID from the current session and links to the account settings page.`;

const meta = {
    title: 'Account/SessionInfoCard',
    component: SessionInfoCard,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: sessionInfoCardDescription,
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-xl">
                <Story />
            </div>
        ),
    ],
    args: {
        username: 'Hans',
        userAccountId: '0b6f5a3e-4c21-4a8e-9d7b-2f1e8c6a1d34',
    },
} satisfies Meta<typeof SessionInfoCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Welcome, Hans!')).toBeInTheDocument();
        await expect(canvas.getByText('0b6f5a3e-4c21-4a8e-9d7b-2f1e8c6a1d34')).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: /account settings/i })).toHaveAttribute(
            'href',
            '/account',
        );
    },
};

export const LongUsername: Story = {
    args: { username: 'a_very_long_username_that_keeps_going_and_going' },
};
