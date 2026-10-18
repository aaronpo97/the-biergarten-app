import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import RegisterStepProgress from './RegisterStepProgress';

const registerStepProgressDescription = `Progress indicator for the multi-step register form. A segmented bar fills one segment per completed step, and a caption names the current step.`;

const meta = {
    title: 'Auth/RegisterStepProgress',
    component: RegisterStepProgress,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: registerStepProgressDescription,
            },
        },
    },
    decorators: [
        (Story) => (
            <div className="w-full max-w-md">
                <Story />
            </div>
        ),
    ],
    args: {
        step: 1,
        totalSteps: 3,
        name: 'Account',
    },
} satisfies Meta<typeof RegisterStepProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Step 1 of 3 · Account')).toBeInTheDocument();
    },
};

export const MiddleStep: Story = {
    args: { step: 2, name: 'Personal details' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Step 2 of 3 · Personal details')).toBeInTheDocument();
    },
};

export const FinalStep: Story = {
    args: { step: 3, name: 'Password' },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText('Step 3 of 3 · Password')).toBeInTheDocument();
    },
};
