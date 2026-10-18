import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import RouteErrorState from './RouteErrorState';

const routeErrorStateDescription = `Error panel rendered by route error boundaries. A thrown \`data()\` response shows its status as the title and its body as the message, with a dedicated title for 503s. Any other error shows a generic message and a retry button that reloads the page.`;

const meta = {
    title: 'Feedback/RouteErrorState',
    component: RouteErrorState,
    tags: ['autodocs'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: routeErrorStateDescription,
            },
        },
    },
} satisfies Meta<typeof RouteErrorState>;

export default meta;
type Story = StoryObj<typeof meta>;

const routeError = (body: string, status: number, statusText: string) => ({
    status,
    statusText,
    data: body,
    internal: false,
});

export const ServiceUnavailable: Story = {
    args: {
        error: routeError(
            'The brewery service is unreachable right now.',
            503,
            'Service Unavailable',
        ),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Service unavailable')).toBeInTheDocument();
        await expect(canvas.getByText(/brewery service is unreachable/i)).toBeInTheDocument();
        await expect(canvas.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    },
};

export const NotFound: Story = {
    args: {
        error: routeError('Brewery not found.', 404, 'Not Found'),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Error 404')).toBeInTheDocument();
        await expect(canvas.getByText('Brewery not found.')).toBeInTheDocument();
    },
};

export const StatusTextFallback: Story = {
    args: {
        error: routeError('', 500, 'Internal Server Error'),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Error 500')).toBeInTheDocument();
        await expect(canvas.getByText('Internal Server Error')).toBeInTheDocument();
    },
};

export const UnexpectedError: Story = {
    args: {
        error: new Error('Something exploded in a loader.'),
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Something went wrong')).toBeInTheDocument();
    },
};
