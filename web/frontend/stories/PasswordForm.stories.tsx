import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { expect, userEvent, within } from 'storybook/test';
import FormField from '../app/components/ui/forms/FormField';
import SubmitButton from '../app/components/ui/forms/SubmitButton';
import { updatePasswordSchema, type UpdatePasswordSchema } from '../app/features/account/schemas';

const passwordFormDescription = `Exercises the real \`updatePasswordSchema\` (zod) through the same react-hook-form wiring used on the account page, including its cross-field rules (confirmation must match, new password must differ from the current one), so these stories validate actual client-side validation behavior rather than just rendering.`;

const PasswordFormDemo = () => {
    const [submitted, setSubmitted] = useState(false);
    const form = useForm<UpdatePasswordSchema>({
        resolver: zodResolver(updatePasswordSchema),
    });

    return (
        <div className="w-full max-w-md space-y-3 rounded-box bg-base-100 p-6 shadow-lg">
            <form className="space-y-3" onSubmit={form.handleSubmit(() => setSubmitted(true))}>
                <FormField
                    id="currentPassword"
                    type="password"
                    label="Current Password"
                    error={form.formState.errors.currentPassword?.message}
                    {...form.register('currentPassword')}
                />
                <FormField
                    id="newPassword"
                    type="password"
                    label="New Password"
                    error={form.formState.errors.newPassword?.message}
                    {...form.register('newPassword')}
                />
                <FormField
                    id="confirmNewPassword"
                    type="password"
                    label="Confirm New Password"
                    error={form.formState.errors.confirmNewPassword?.message}
                    {...form.register('confirmNewPassword')}
                />
                <SubmitButton
                    isSubmitting={false}
                    idleText="Change Password"
                    submittingText="Changing..."
                />
            </form>
            {submitted ? <p data-testid="submit-result">Password changed</p> : null}
        </div>
    );
};

const meta = {
    title: 'Forms/PasswordForm',
    component: PasswordFormDemo,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: passwordFormDescription,
            },
        },
    },
} satisfies Meta<typeof PasswordFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

const fillPasswordForm = async (
    canvas: ReturnType<typeof within>,
    values: { current: string; next: string; confirm: string },
) => {
    await userEvent.type(canvas.getByLabelText(/current password/i), values.current);
    await userEvent.type(canvas.getByLabelText('New Password'), values.next);
    await userEvent.type(canvas.getByLabelText(/confirm new password/i), values.confirm);
    await userEvent.click(canvas.getByRole('button', { name: /change password/i }));
};

export const RejectsShortPassword: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillPasswordForm(canvas, {
            current: 'OldPassword1!',
            next: 'short',
            confirm: 'short',
        });
        await expect(canvas.getByText(/at least 8 characters/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const RejectsMismatchedConfirmation: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillPasswordForm(canvas, {
            current: 'OldPassword1!',
            next: 'NewPassword2!',
            confirm: 'NewPassword3!',
        });
        await expect(canvas.getByText(/passwords must match/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const RejectsReusingCurrentPassword: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillPasswordForm(canvas, {
            current: 'SamePassword1!',
            next: 'SamePassword1!',
            confirm: 'SamePassword1!',
        });
        await expect(canvas.getByText(/different from the current password/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const AcceptsValidPasswordChange: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillPasswordForm(canvas, {
            current: 'OldPassword1!',
            next: 'NewPassword2!',
            confirm: 'NewPassword2!',
        });
        await expect(canvas.getByTestId('submit-result')).toBeInTheDocument();
    },
};
