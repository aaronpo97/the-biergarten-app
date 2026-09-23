import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import ActivityTab from './ActivityTab';
import { FILLER_ACTIVITY } from '../../../utils/filler-user-profile';

const activityTabDescription = `A profile's Activity tab: ratings, likes, and comments as a vertical feed, newest first. Renders the empty-state card when the collection is empty.`;

const meta = {
    title: 'Users/ActivityTab',
    component: ActivityTab,
    tags: ['autodocs'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: activityTabDescription,
            },
        },
    },
} satisfies Meta<typeof ActivityTab>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Populated: Story = {
    args: { activity: FILLER_ACTIVITY },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText(/interurban ipa/i)).toBeInTheDocument();
        await expect(canvas.getByText(/best fruited stout/i)).toBeInTheDocument();
    },
};

export const Empty: Story = {
    args: { activity: [] },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(
            canvas.getByText('No activity yet. Ratings, likes, and comments will show up here.'),
        ).toBeInTheDocument();
    },
};
