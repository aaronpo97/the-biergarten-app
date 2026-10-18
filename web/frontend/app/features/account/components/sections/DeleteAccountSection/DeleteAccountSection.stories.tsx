import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMemoryRouter, redirect, RouterProvider, useActionData } from 'react-router';
import { expect, userEvent, within } from 'storybook/test';
import DeleteAccountSection from './DeleteAccountSection';
import type { ActionResult } from '../../../types';

const deleteAccountSectionDescription = `Renders the real \`DeleteAccountSection\` component (the account page's danger-zone card and its confirmation dialog) behind a memory router so its \`useSubmit\`/\`useNavigation\` wiring runs against a fake action. Confirming the dialog posts the \`delete\` intent; the fake action redirects to a marker route, matching how the real route signs the user out after deletion.`;

const DeleteAccountSectionRoute = () => {
    const result = useActionData() as ActionResult | undefined;

    return (
        <div className="w-full max-w-xl">
            <DeleteAccountSection
                userAccountId="0b6f5a3e-4c21-4a8e-9d7b-2f1e8c6a1d34"
                result={result}
            />
        </div>
    );
};

const DeleteAccountSectionHarness = () => {
    const [router] = useState(() =>
        createMemoryRouter([
            {
                path: '/',
                element: <DeleteAccountSectionRoute />,
                action: async () => redirect('/deleted'),
            },
            {
                path: '/deleted',
                element: <p data-testid="redirect-deleted">Account deleted.</p>,
            },
        ]),
    );

    return <RouterProvider router={router} />;
};

const meta = {
    title: 'Account/DeleteAccountSection',
    component: DeleteAccountSectionHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        usesDataRouter: true,
        docs: {
            description: {
                component: deleteAccountSectionDescription,
            },
        },
    },
} satisfies Meta<typeof DeleteAccountSectionHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const ConfirmationDialogOpen: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /^delete$/i }));
        const dialog = within(await within(document.body).findByRole('dialog'));
        await expect(dialog.getByText(/delete your account\?/i)).toBeInTheDocument();
    },
};

export const CancelClosesDialog: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /^delete$/i }));
        const body = within(document.body);
        await userEvent.click(await body.findByRole('button', { name: /cancel/i }));
        await expect(body.queryByRole('dialog')).not.toBeInTheDocument();
    },
};

export const ConfirmDeletesAccount: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.click(canvas.getByRole('button', { name: /^delete$/i }));
        const body = within(document.body);
        await userEvent.click(await body.findByRole('button', { name: /yes, delete my account/i }));
        await expect(await canvas.findByTestId('redirect-deleted')).toBeInTheDocument();
    },
};
