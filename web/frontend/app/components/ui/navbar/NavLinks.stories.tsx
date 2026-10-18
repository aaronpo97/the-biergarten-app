import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import NavLinks from './NavLinks';

const navLinksDescription = `Primary navigation links used by the Navbar. The desktop variant is a horizontal row shown from the \`lg\` breakpoint up; the mobile variant is a vertical list that can also offer a registration link for guests.`;

const meta = {
    title: 'Navigation/NavLinks',
    component: NavLinks,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: navLinksDescription,
            },
        },
    },
} satisfies Meta<typeof NavLinks>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Desktop: Story = {
    args: { variant: 'desktop', showRegister: false },
    parameters: { viewport: { defaultViewport: 'desktop' } },
};

export const MobileGuest: Story = {
    args: { variant: 'mobile', showRegister: true },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Breweries' })).toHaveAttribute(
            'href',
            '/breweries',
        );
        await expect(canvas.getByRole('link', { name: /register user/i })).toHaveAttribute(
            'href',
            '/register',
        );
    },
};

export const MobileAuthenticated: Story = {
    args: { variant: 'mobile', showRegister: false },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getAllByRole('link')).toHaveLength(4);
        await expect(
            canvas.queryByRole('link', { name: /register user/i }),
        ).not.toBeInTheDocument();
    },
};
