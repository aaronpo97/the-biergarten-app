import type { Meta, StoryObj } from '@storybook/react-vite';
import { Lock } from 'iconoir-react';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import SectionCard from '../app/components/account/SectionCard';

const sectionCardDescription = `Collapsible card used on the account settings page to group a labeled form behind a toggle. These stories cover the closed and open states, plus the toggle interaction, so you can review spacing, icon alignment, and disclosure behavior in isolation.`;

function SectionCardDemo(props: React.ComponentProps<typeof SectionCard>) {
   const [open, setOpen] = useState(props.open);
   return (
      <div className="w-full max-w-md">
         <SectionCard {...props} open={open} onToggle={() => setOpen((value) => !value)} />
      </div>
   );
}

const meta = {
   title: 'Account/SectionCard',
   component: SectionCard,
   tags: ['autodocs'],
   args: {
      icon: <Lock className="size-5" aria-hidden="true" />,
      title: 'Password',
      description: 'Change the password used to sign in.',
      open: false,
      onToggle: () => undefined,
      children: <p className="text-sm">Form fields go here.</p>,
   },
   parameters: {
      layout: 'centered',
      docs: {
         description: {
            component: sectionCardDescription,
         },
      },
   },
   render: (args) => <SectionCardDemo {...args} />,
} satisfies Meta<typeof SectionCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
   play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await expect(canvas.getByText('Password')).toBeInTheDocument();
      await expect(canvas.queryByText('Form fields go here.')).not.toBeInTheDocument();
   },
};

export const Open: Story = {
   args: {
      open: true,
   },
   play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      await expect(canvas.getByText('Form fields go here.')).toBeInTheDocument();
   },
};

export const ToggleInteraction: Story = {
   play: async ({ canvasElement }) => {
      const canvas = within(canvasElement);
      const toggle = canvas.getByLabelText(/toggle password form/i);

      await expect(canvas.queryByText('Form fields go here.')).not.toBeInTheDocument();

      await userEvent.click(toggle);
      await expect(canvas.getByText('Form fields go here.')).toBeInTheDocument();

      await userEvent.click(toggle);
      await expect(canvas.queryByText('Form fields go here.')).not.toBeInTheDocument();
   },
};
