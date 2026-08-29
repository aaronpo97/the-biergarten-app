import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMemoryRouter, redirect, RouterProvider, useActionData } from 'react-router';
import { expect, userEvent, within } from 'storybook/test';
import PasswordSection from './PasswordSection';
import { updatePasswordSchema } from '../schemas';
import type { ActionResult } from '../types';

const passwordSectionDescription = `Renders the real \`PasswordSection\` component (the account page's collapsible password-change card) behind a memory router so its \`useSubmit\`/\`useNavigation\` wiring runs against a fake action, exercising the real \`updatePasswordSchema\` (zod) cross-field rules. On success the real action redirects back to the account page with a toast message instead of returning data - here it redirects to a marker route so the redirect itself is the observable outcome, matching how the real route behaves.`;

const PasswordSectionRoute = () => {
    const [open, setOpen] = useState(true);
    const result = useActionData() as ActionResult | undefined;

    return (
        <div className="w-full max-w-md">
            <PasswordSection
                open={open}
                onToggle={() => setOpen((value) => !value)}
                result={result}
            />
        </div>
    );
};

const PasswordSectionHarness = () => {
    const [router] = useState(() =>
        createMemoryRouter([
            {
                path: '/',
                element: <PasswordSectionRoute />,
                action: async ({ request }) => {
                    const formData = await request.formData();
                    const parsed = updatePasswordSchema.safeParse({
                        currentPassword: formData.get('currentPassword'),
                        newPassword: formData.get('newPassword'),
                        confirmNewPassword: formData.get('confirmNewPassword'),
                    });

                    if (!parsed.success) {
                        return {
                            intent: 'password',
                            error: parsed.error.issues[0].message,
                        } satisfies ActionResult;
                    }

                    return redirect('/success');
                },
            },
            {
                path: '/success',
                element: <p data-testid="redirect-success">Password changed successfully.</p>,
            },
        ]),
    );

    return <RouterProvider router={router} />;
};

const meta = {
    title: 'Account/PasswordSection',
    component: PasswordSectionHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        usesDataRouter: true,
        docs: {
            description: {
                component: passwordSectionDescription,
            },
        },
    },
} satisfies Meta<typeof PasswordSectionHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

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
        await expect(canvas.getByTestId('redirect-success')).toBeInTheDocument();
    },
};
