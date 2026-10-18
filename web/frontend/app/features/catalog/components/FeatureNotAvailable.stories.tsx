import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import FeatureNotAvailable from './FeatureNotAvailable';

const featureNotAvailableDescription = `Placeholder panel for catalog pages that cannot be used yet. The \`reason\` prop selects the icon, copy and actions: still in development, offline for maintenance, or requiring a signed-in session.`;

const meta = {
    title: 'Catalog/FeatureNotAvailable',
    component: FeatureNotAvailable,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: featureNotAvailableDescription,
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-2xl">
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof FeatureNotAvailable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Soon: Story = {
    args: { reason: 'soon' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('heading', { name: /not available yet/i }),
        ).toBeInTheDocument();
        await expect(canvas.getByRole('link', { name: /browse breweries/i })).toHaveAttribute(
            'href',
            '/breweries',
        );
    },
};

export const Maintenance: Story = {
    args: { reason: 'maintenance' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByRole('heading', { name: /temporarily unavailable/i }),
        ).toBeInTheDocument();
        await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
    },
};

export const AuthRequired: Story = {
    args: { reason: 'auth' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByRole('link', { name: 'Login' })).toHaveAttribute('href', '/login');
        await expect(canvas.getByRole('link', { name: 'Register' })).toHaveAttribute(
            'href',
            '/register',
        );
    },
};
