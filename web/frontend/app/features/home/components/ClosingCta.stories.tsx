import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ClosingCta from './ClosingCta';

const closingCtaDescription = `Landing page closing call to action: centred headline with the sign-up and sign-in pair.`;

const meta = {
    title: 'Home/ClosingCta',
    component: ClosingCta,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: closingCtaDescription,
            },
        },
    },
} satisfies Meta<typeof ClosingCta>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        await expect(
            canvas.getByRole('heading', { name: /your next favourite brewery is on the list/i }),
        ).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
            'href',
            '/register',
        );
        await expect(canvas.getByRole('link', { name: 'Sign in' })).toHaveAttribute(
            'href',
            '/login',
        );
    },
};
