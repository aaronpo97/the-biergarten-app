import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import RegisterForm from '../app/features/auth/components/RegisterForm';
import { registerSchema, type RegisterSchema } from '../app/features/auth/schemas';

const registerFormDescription = `Renders the real \`RegisterForm\` component wired to the real \`registerSchema\` (zod) through the same react-hook-form setup used on the register page, including its cross-field rule that the confirmation must match the password, so these stories validate actual client-side validation behavior rather than a re-implemented form.`;

const RegisterFormHarness = () => {
    const [submitted, setSubmitted] = useState<RegisterSchema | null>(null);
    const form = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

    return (
        <div className="w-full max-w-lg space-y-3 rounded-box bg-base-100 p-6 shadow-lg">
            <RegisterForm
                onSubmit={form.handleSubmit((values) => setSubmitted(values))}
                formState={form.formState}
                register={form.register}
                submitting={false}
            />
            {submitted ? <p data-testid="submit-result">Registered {submitted.username}</p> : null}
        </div>
    );
};

const meta = {
    title: 'Forms/RegisterForm',
    component: RegisterFormHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: registerFormDescription,
            },
        },
    },
} satisfies Meta<typeof RegisterFormHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

const fillValidRegistration = async (canvas: ReturnType<typeof within>) => {
    await userEvent.type(canvas.getByLabelText(/^username$/i), 'jane_doe');
    await userEvent.type(canvas.getByLabelText(/first name/i), 'Jane');
    await userEvent.type(canvas.getByLabelText(/last name/i), 'Doe');
    await userEvent.type(canvas.getByLabelText(/^email$/i), 'jane@example.com');
    await fireEvent.change(canvas.getByLabelText(/date of birth/i), {
        target: { value: '2000-01-15' },
    });
    await userEvent.type(canvas.getByLabelText('Password'), 'StrongPass1!');
    await userEvent.type(canvas.getByLabelText(/confirm password/i), 'StrongPass1!');
};

export const RejectsEmptySubmission: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
        await expect(
            canvas.getByText(/username must be at least 3 characters/i),
        ).toBeInTheDocument();
        await expect(canvas.getByText(/first name is required/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const RejectsInvalidEmail: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillValidRegistration(canvas);
        await userEvent.clear(canvas.getByLabelText(/^email$/i));
        await userEvent.type(canvas.getByLabelText(/^email$/i), 'jane@example');
        await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
        await expect(canvas.getByText(/invalid email address/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const RejectsWeakPassword: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillValidRegistration(canvas);
        await userEvent.clear(canvas.getByLabelText('Password'));
        await userEvent.type(canvas.getByLabelText('Password'), 'weakpassword');
        await userEvent.clear(canvas.getByLabelText(/confirm password/i));
        await userEvent.type(canvas.getByLabelText(/confirm password/i), 'weakpassword');
        await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
        await expect(canvas.getByText(/uppercase letter/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const RejectsMismatchedConfirmPassword: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillValidRegistration(canvas);
        await userEvent.clear(canvas.getByLabelText(/confirm password/i));
        await userEvent.type(canvas.getByLabelText(/confirm password/i), 'Different1!');
        await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
        await expect(canvas.getByText(/passwords must match/i)).toBeInTheDocument();
        await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
    },
};

export const AcceptsValidRegistration: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await fillValidRegistration(canvas);
        await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
        await expect(canvas.getByTestId('submit-result')).toHaveTextContent('jane_doe');
    },
};
