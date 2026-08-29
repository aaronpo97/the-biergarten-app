import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import FormField from './FormField';

const formFieldDescription = `Reusable labeled input for Biergarten forms. This page shows guided, error, and password states so you can review label spacing, helper text, validation messaging, and ARIA behavior in the same card layout used across the app.`;

const meta = {
    title: 'Forms/FormField',
    component: FormField,
    tags: ['autodocs'],
    args: {
        id: 'email',
        name: 'email',
        type: 'email',
        label: 'Email address',
        placeholder: 'you@example.com',
        hint: 'We only use this to manage your account.',
    },
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: formFieldDescription,
            },
        },
    },
    render: (args) => (
        <div className="w-full max-w-md rounded-box bg-base-100 p-6 shadow-lg">
            <FormField {...args} />
        </div>
    ),
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithHint: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByLabelText(/email address/i)).toBeInTheDocument();
        await expect(canvas.getByText(/manage your account/i)).toBeInTheDocument();
    },
};

export const WithError: Story = {
    args: {
        error: 'Please enter a valid email address.',
        hint: undefined,
        'aria-invalid': true,
        defaultValue: 'not-an-email',
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await expect(canvas.getByText(/valid email address/i)).toBeInTheDocument();
        await expect(canvas.getByLabelText(/email address/i)).toHaveAttribute(
            'aria-invalid',
            'true',
        );
    },
};

export const PasswordField: Story = {
    args: {
        id: 'password',
        name: 'password',
        type: 'password',
        label: 'Password',
        placeholder: 'Enter a strong password',
        hint: 'Use 12 or more characters.',
    },
};
