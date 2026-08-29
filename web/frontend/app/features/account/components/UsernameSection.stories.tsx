import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMemoryRouter, redirect, RouterProvider, useActionData } from 'react-router';
import { expect, userEvent, within } from 'storybook/test';
import UsernameSection from './UsernameSection';
import { updateUsernameSchema } from '../schemas';
import type { ActionResult } from '../types';

const usernameSectionDescription = `Renders the real \`UsernameSection\` component (the account page's collapsible username-change card) behind a memory router so its \`useSubmit\`/\`useNavigation\` wiring runs against a fake action, exercising the real \`updateUsernameSchema\` (zod) validation. On success the real action redirects back to the account page with a toast message instead of returning data - here it redirects to a marker route so the redirect itself is the observable outcome, matching how the real route behaves.`;

const UsernameSectionRoute = () => {
    const [open, setOpen] = useState(true);
    const result = useActionData() as ActionResult | undefined;

    return (
        <div className="w-full max-w-md">
            <UsernameSection
                username="jane_doe"
                open={open}
                onToggle={() => setOpen((value) => !value)}
                result={result}
            />
        </div>
    );
};

const UsernameSectionHarness = () => {
    const [router] = useState(() =>
        createMemoryRouter([
            {
                path: '/',
                element: <UsernameSectionRoute />,
                action: async ({ request }) => {
                    const formData = await request.formData();
                    const parsed = updateUsernameSchema.safeParse({
                        newUsername: formData.get('newUsername'),
                    });

                    if (!parsed.success) {
                        return {
                            intent: 'username',
                            error: parsed.error.issues[0].message,
                        } satisfies ActionResult;
                    }

                    return redirect('/success');
                },
            },
            {
                path: '/success',
                element: <p data-testid="redirect-success">Username updated successfully.</p>,
            },
        ]),
    );

    return <RouterProvider router={router} />;
};

const meta = {
    title: 'Account/UsernameSection',
    component: UsernameSectionHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        usesDataRouter: true,
        docs: {
            description: {
                component: usernameSectionDescription,
            },
        },
    },
} satisfies Meta<typeof UsernameSectionHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const RejectsShortUsername: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.clear(canvas.getByLabelText(/new username/i));
        await userEvent.type(canvas.getByLabelText(/new username/i), 'ab');
        await userEvent.click(canvas.getByRole('button', { name: /update username/i }));
        await expect(canvas.getByText(/at least 3 characters/i)).toBeInTheDocument();
    },
};

export const RejectsInvalidCharacters: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.clear(canvas.getByLabelText(/new username/i));
        await userEvent.type(canvas.getByLabelText(/new username/i), 'bad user!');
        await userEvent.click(canvas.getByRole('button', { name: /update username/i }));
        await expect(canvas.getByText(/letters, numbers, dots, underscores/i)).toBeInTheDocument();
    },
};

export const AcceptsValidUsername: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.clear(canvas.getByLabelText(/new username/i));
        await userEvent.type(canvas.getByLabelText(/new username/i), 'valid.user-99');
        await userEvent.click(canvas.getByRole('button', { name: /update username/i }));
        await expect(canvas.getByTestId('redirect-success')).toBeInTheDocument();
    },
};
