import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import SubmitButton from '../app/components/ui/forms/SubmitButton';

const submitButtonDescription = `Shared submit action for Biergarten forms. These stories cover the idle, loading, and custom-width states so you can verify button copy, disabled behavior during submission, and theme styling without wiring up a full form flow.`;

const meta = {
   title: 'Forms/SubmitButton',
   component: SubmitButton,
   tags: ['autodocs'],
   args: {
      idleText: 'Save changes',
      submittingText: 'Saving changes',
      isSubmitting: false,
   },
   parameters: {
      layout: 'centered',
      docs: {
         description: {
            component: submitButtonDescription,
         },
      },
   },
} satisfies Meta<typeof SubmitButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {
   play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await expect(canvas.getByRole('button', { name: /save changes/i })).toBeEnabled();
   },
};

export const Submitting: Story = {
   args: {
      isSubmitting: true,
   },
   play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await expect(canvas.getByRole('button', { name: /saving changes/i })).toBeDisabled();
   },
};

export const CustomWidth: Story = {
   args: {
      className: 'btn btn-secondary min-w-64',
      idleText: 'Register user',
      submittingText: 'Registering user',
   },
};
