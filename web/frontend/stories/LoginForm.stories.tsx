import { zodResolver } from '@hookform/resolvers/zod';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { expect, userEvent, within } from 'storybook/test';
import FormField from '../app/components/ui/forms/FormField';
import SubmitButton from '../app/components/ui/forms/SubmitButton';
import { loginSchema, type LoginSchema } from '../app/features/auth/schemas';

const loginFormDescription = `Exercises the real \`loginSchema\` (zod) through the same react-hook-form wiring used on the login page, so these stories validate actual client-side validation behavior rather than just rendering.`;

function LoginFormDemo() {
   const [submitted, setSubmitted] = useState<LoginSchema | null>(null);
   const form = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

   return (
      <div className="w-full max-w-md space-y-3 rounded-box bg-base-100 p-6 shadow-lg">
         <form className="space-y-3" onSubmit={form.handleSubmit((values) => setSubmitted(values))}>
            <FormField
               id="username"
               type="text"
               label="Username"
               error={form.formState.errors.username?.message}
               {...form.register('username')}
            />
            <FormField
               id="password"
               type="password"
               label="Password"
               error={form.formState.errors.password?.message}
               {...form.register('password')}
            />
            <SubmitButton isSubmitting={false} idleText="Sign In" submittingText="Signing in..." />
         </form>
         {submitted ? <p data-testid="submit-result">Signed in as {submitted.username}</p> : null}
      </div>
   );
}

const meta = {
   title: 'Forms/LoginForm',
   component: LoginFormDemo,
   tags: ['autodocs'],
   parameters: {
      layout: 'centered',
      docs: {
         description: {
            component: loginFormDescription,
         },
      },
   },
} satisfies Meta<typeof LoginFormDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};

export const RejectsEmptySubmission: Story = {
   play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: /sign in/i }));
      await expect(canvas.getByText(/username is required/i)).toBeInTheDocument();
      await expect(canvas.getByText(/password is required/i)).toBeInTheDocument();
      await expect(canvas.queryByTestId('submit-result')).not.toBeInTheDocument();
   },
};

export const AcceptsValidLogin: Story = {
   play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await userEvent.type(canvas.getByLabelText(/username/i), 'hans');
      await userEvent.type(canvas.getByLabelText(/password/i), 'correct-horse-battery');
      await userEvent.click(canvas.getByRole('button', { name: /sign in/i }));
      await expect(canvas.getByTestId('submit-result')).toHaveTextContent('hans');
   },
};
