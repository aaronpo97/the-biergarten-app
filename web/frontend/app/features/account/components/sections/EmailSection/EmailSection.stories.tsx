import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMemoryRouter, redirect, RouterProvider, useActionData } from 'react-router';
import { expect, userEvent, within } from 'storybook/test';
import EmailSection from './EmailSection';
import { updateEmailSchema } from '../../../schemas';
import type { ActionResult } from '../../../types';

const emailSectionDescription = `Renders the real \`EmailSection\` component (the account page's collapsible email-change card) behind a memory router so its \`useSubmit\`/\`useNavigation\` wiring runs against a fake action, exercising the real \`updateEmailSchema\` (zod) validation. On success the real action redirects back to the account page with a toast message instead of returning data - here it redirects to a marker route so the redirect itself is the observable outcome, matching how the real route behaves.`;

const EmailSectionRoute = () => {
    const [open, setOpen] = useState(true);
    const result = useActionData() as ActionResult | undefined;

    return (
        <div className="w-full max-w-md">
            <EmailSection
                email="jane@example.com"
                open={open}
                onToggle={() => setOpen((value) => !value)}
                result={result}
            />
        </div>
    );
};

const EmailSectionHarness = () => {
    const [router] = useState(() =>
        createMemoryRouter([
            {
                path: '/',
                element: <EmailSectionRoute />,
                action: async ({ request }) => {
                    const formData = await request.formData();
                    const parsed = updateEmailSchema.safeParse({
                        newEmail: formData.get('newEmail'),
                    });

                    if (!parsed.success) {
                        return {
                            intent: 'email',
                            error: parsed.error.issues[0].message,
                        } satisfies ActionResult;
                    }

                    return redirect('/success');
                },
            },
            {
                path: '/success',
                element: <p data-testid="redirect-success">Email updated successfully.</p>,
            },
        ]),
    );

    return <RouterProvider router={router} />;
};

const meta = {
    title: 'Account/EmailSection',
    component: EmailSectionHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        usesDataRouter: true,
        docs: {
            description: {
                component: emailSectionDescription,
            },
        },
    },
} satisfies Meta<typeof EmailSectionHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const RejectsInvalidEmail: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.clear(canvas.getByLabelText(/new email/i));
        await userEvent.type(canvas.getByLabelText(/new email/i), 'jane@example');
        await userEvent.click(canvas.getByRole('button', { name: /update email/i }));
        await expect(canvas.getByText(/invalid email address/i)).toBeInTheDocument();
    },
};

export const AcceptsValidEmail: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.clear(canvas.getByLabelText(/new email/i));
        await userEvent.type(canvas.getByLabelText(/new email/i), 'new.address@example.com');
        await userEvent.click(canvas.getByRole('button', { name: /update email/i }));
        await expect(canvas.getByTestId('redirect-success')).toBeInTheDocument();
    },
};
