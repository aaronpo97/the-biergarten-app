import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import StarRating from '../app/features/breweries/components/StarRating';

const starRatingDescription = `Dual-purpose star control built on daisyUI's \`rating\` component. Read-only (no \`onChange\`) when used for an average or a display rating; interactive otherwise — clicking the currently-selected star clears the rating, since daisyUI radios can't do that natively.`;

const meta = {
    title: 'Breweries/StarRating',
    component: StarRating,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: starRatingDescription,
            },
        },
    },
} satisfies Meta<typeof StarRating>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ReadOnly: Story = {
    args: { value: 4, size: 'sm' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.queryByRole('radio')).not.toBeInTheDocument();
        await expect(canvas.getByLabelText('4 out of 5 stars')).toBeInTheDocument();
    },
};

export const Interactive: Story = {
    args: { value: 0, size: 'lg', onChange: fn() },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('radio', { name: 'Rate 3 of 5' }));
        await expect(args.onChange).toHaveBeenCalledWith(3);
    },
};

export const InteractiveClearsOnRepeatClick: Story = {
    args: { value: 3, size: 'lg', onChange: fn() },
    play: async ({ args, canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('radio', { name: 'Rate 3 of 5' }));
        await expect(args.onChange).toHaveBeenCalledWith(0);
    },
};
