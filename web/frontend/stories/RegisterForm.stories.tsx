import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { expect, fireEvent, userEvent, within } from 'storybook/test';
import FormField from '../app/components/forms/FormField';
import SubmitButton from '../app/components/forms/SubmitButton';
import { registerSchema, type RegisterSchema } from '../app/lib/schemas';

const registerFormDescription = `Exercises the real \`registerSchema\` (zod) through the same react-hook-form wiring used on the register page, including its cross-field rule that the confirmation must match the password, so these stories validate actual client-side validation behavior rather than just rendering.`;

function RegisterFormDemo() {
   const [submitted, setSubmitted] = useState<RegisterSchema | null>(null);
   const form = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

   return (
      <div className="w-full max-w-lg space-y-3 rounded-box bg-base-100 p-6 shadow-lg">
         <form className="space-y-3" onSubmit={form.handleSubmit((values) => setSubmitted(values))}>
            <FormField
               id="username"
               type="text"
               label="Username"
               error={form.formState.errors.username?.message}
               {...form.register('username')}
            />
            <div className="grid grid-cols-2 gap-3">
               <FormField
                  id="firstName"
                  type="text"
                  label="First Name"
                  error={form.formState.errors.firstName?.message}
                  {...form.register('firstName')}
               />
               <FormField
                  id="lastName"
                  type="text"
                  label="Last Name"
                  error={form.formState.errors.lastName?.message}
                  {...form.register('lastName')}
               />
            </div>
            <FormField
               id="email"
               type="email"
               label="Email"
               error={form.formState.errors.email?.message}
               {...form.register('email')}
            />
            <FormField
               id="dateOfBirth"
               type="date"
               label="Date of Birth"
               error={form.formState.errors.dateOfBirth?.message}
               {...form.register('dateOfBirth')}
            />
            <FormField
               id="password"
               type="password"
               label="Password"
               error={form.formState.errors.password?.message}
               {...form.register('password')}
            />
            <FormField
               id="confirmPassword"
               type="password"
               label="Confirm Password"
               error={form.formState.errors.confirmPassword?.message}
               {...form.register('confirmPassword')}
            />
            <SubmitButton
               isSubmitting={false}
               idleText="Create Account"
               submittingText="Creating account..."
            />
         </form>
         {submitted ? <p data-testid="submit-result">Registered {submitted.username}</p> : null}
      </div>
   );
}

const meta = {
   title: 'Forms/RegisterForm',
   component: RegisterFormDemo,
   tags: ['autodocs'],
   parameters: {
      layout: 'centered',
      docs: {
         description: {
            component: registerFormDescription,
         },
      },
   },
} satisfies Meta<typeof RegisterFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

async function fillValidRegistration(canvas: ReturnType<typeof within>) {
   await userEvent.type(canvas.getByLabelText(/^username$/i), 'jane_doe');
   await userEvent.type(canvas.getByLabelText(/first name/i), 'Jane');
   await userEvent.type(canvas.getByLabelText(/last name/i), 'Doe');
   await userEvent.type(canvas.getByLabelText(/^email$/i), 'jane@example.com');
   await fireEvent.change(canvas.getByLabelText(/date of birth/i), { target: { value: '2000-01-15' } });
   await userEvent.type(canvas.getByLabelText('Password'), 'StrongPass1!');
   await userEvent.type(canvas.getByLabelText(/confirm password/i), 'StrongPass1!');
}

export const RejectsEmptySubmission: Story = {
   play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: /create account/i }));
      await expect(canvas.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
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
