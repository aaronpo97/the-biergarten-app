import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import LandingFooter from './LandingFooter';

const landingFooterDescription = `Landing page footer. The last link follows the session: Login when signed out, Dashboard when signed in.`;

const meta = {
    title: 'Home/LandingFooter',
    component: LandingFooter,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: landingFooterDescription,
            },
        },
    },
} satisfies Meta<typeof LandingFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SignedOut: Story = {
    args: { isAuthenticated: false },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
        await expect(canvas.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument();
        await expect(canvas.getByText('Please drink responsibly.')).toBeInTheDocument();
    },
};

export const SignedIn: Story = {
    args: { isAuthenticated: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(canvas.getByRole('link', { name: 'Dashboard' })).toHaveAttribute(
            'href',
            '/dashboard',
        );
        await expect(canvas.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
    },
};
