import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { expect, userEvent, within } from 'storybook/test';
import FormField from '../app/components/ui/forms/FormField';
import SubmitButton from '../app/components/ui/forms/SubmitButton';
import { updateUsernameSchema, type UpdateUsernameSchema } from '../app/features/account/schemas';

const usernameFormDescription = `Exercises the real \`updateUsernameSchema\` (zod) through the same react-hook-form wiring used on the account page, so these stories validate actual client-side validation behavior rather than just rendering.`;

const UsernameFormDemo = () => {
    const [submitted, setSubmitted] = useState<string | null>(null);
    const form = useForm<UpdateUsernameSchema>({
        resolver: zodResolver(updateUsernameSchema),
        defaultValues: { newUsername: '' },
    });

    return (
        <div className="w-full max-w-md space-y-3 rounded-box bg-base-100 p-6 shadow-lg">
            <form
                className="space-y-3"
                onSubmit={form.handleSubmit((values) => setSubmitted(values.newUsername))}
            >
                <FormField
                    id="newUsername"
                    type="text"
                    label="New Username"
                    error={form.formState.errors.newUsername?.message}
                    {...form.register('newUsername')}
                />
                <SubmitButton
                    isSubmitting={false}
                    idleText="Update Username"
                    submittingText="Updating..."
                />
            </form>
            {submitted ? <p data-testid="submit-result">Submitted: {submitted}</p> : null}
        </div>
    );
};

const meta = {
    title: 'Forms/UsernameForm',
    component: UsernameFormDemo,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: usernameFormDescription,
            },
        },
    },
} satisfies Meta<typeof UsernameFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const RejectsShortUsername: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByLabelText(/new username/i), 'ab');
        await userEvent.click(canvas.getByRole('button', { name: /update username/i }));
        await expect(canvas.getByText(/at least 3 characters/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const RejectsInvalidCharacters: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByLabelText(/new username/i), 'bad user!');
        await userEvent.click(canvas.getByRole('button', { name: /update username/i }));
        await expect(canvas.getByText(/letters, numbers, dots, underscores/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const AcceptsValidUsername: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.type(canvas.getByLabelText(/new username/i), 'valid.user-99');
        await userEvent.click(canvas.getByRole('button', { name: /update username/i }));
        await expect(canvas.getByTestId('submit-result')).toHaveTextContent('valid.user-99');
    },
};
