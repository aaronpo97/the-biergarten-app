import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import YourRatingCard from '../app/features/breweries/components/YourRatingCard';

const yourRatingCardDescription = `Interactive 1-5 star rating control on the brewery detail page. The hint text switches once a rating is set, and clicking the selected star again clears it.`;

const meta = {
    title: 'Breweries/YourRatingCard',
    component: YourRatingCard,
    tags: ['autodocs'],
    args: {
        onChange: fn(),
    },
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: yourRatingCardDescription,
            },
        },
    },
} satisfies Meta<typeof YourRatingCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Unrated: Story = {
    args: { value: 0 },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Tap a star to rate this brewery.')).toBeInTheDocument();
        await userEvent.click(canvas.getByRole('radio', { name: 'Rate 4 of 5' }));
        await expect(args.onChange).toHaveBeenCalledWith(4);
    },
};

export const Rated: Story = {
    args: { value: 4 },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByText('You rated this 4 of 5. Tap the same star to clear.'),
        ).toBeInTheDocument();
    },
};
