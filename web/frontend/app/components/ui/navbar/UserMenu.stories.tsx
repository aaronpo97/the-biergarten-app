import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, screen, userEvent, within } from 'storybook/test';
import UserMenu from './UserMenu';

const userMenuDescription = `Account dropdown shown in the Navbar for signed-in users. The button shows the username and opens a menu linking to the user's profile, the dashboard and logout.`;

const meta = {
    title: 'Navigation/UserMenu',
    component: UserMenu,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: userMenuDescription,
            },
        },
    },
    args: {
        username: 'Hans',
        userAccountId: '0b6f5a3e-4c21-4a8e-9d7b-2f1e8c6a1d34',
    },
} satisfies Meta<typeof UserMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('button', { name: 'Hans' })).toBeInTheDocument();
    },
};

export const Open: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: 'Hans' }));
        await expect(await screen.findByRole('menuitem', { name: /my profile/i })).toHaveAttribute(
            'href',
            '/users/0b6f5a3e-4c21-4a8e-9d7b-2f1e8c6a1d34',
        );
        await expect(screen.getByRole('menuitem', { name: /dashboard/i })).toHaveAttribute(
            'href',
            '/dashboard',
        );
        await expect(screen.getByRole('menuitem', { name: /logout/i })).toHaveAttribute(
            'href',
            '/logout',
        );
    },
};
