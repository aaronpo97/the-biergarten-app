import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { createMemoryRouter, redirect, RouterProvider, useActionData } from 'react-router';
import { expect, userEvent, within } from 'storybook/test';
import ProfileSection from './ProfileSection';
import { updateProfileSchema } from '../../../schemas';
import type { ActionResult } from '../../../types';

const profileSectionDescription = `Renders the real \`ProfileSection\` component (the account page's collapsible name and date-of-birth card) behind a memory router so its \`useSubmit\`/\`useNavigation\` wiring runs against a fake action, exercising the real \`updateProfileSchema\` (zod) validation. On success the real action redirects back to the account page with a toast message instead of returning data - here it redirects to a marker route so the redirect itself is the observable outcome, matching how the real route behaves.`;

const ProfileSectionRoute = () => {
    const [open, setOpen] = useState(true);
    const result = useActionData() as ActionResult | undefined;

    return (
        <div className="w-full max-w-md">
            <ProfileSection
                firstName="Jane"
                lastName="Doe"
                dateOfBirth="1990-04-12"
                open={open}
                onToggle={() => setOpen((value) => !value)}
                result={result}
            />
        </div>
    );
};

const ProfileSectionHarness = () => {
    const [router] = useState(() =>
        createMemoryRouter([
            {
                path: '/',
                element: <ProfileSectionRoute />,
                action: async ({ request }) => {
                    const formData = await request.formData();
                    const parsed = updateProfileSchema.safeParse({
                        firstName: formData.get('firstName'),
                        lastName: formData.get('lastName'),
                        dateOfBirth: formData.get('dateOfBirth'),
                    });

                    if (!parsed.success) {
                        return {
                            intent: 'profile',
                            error: parsed.error.issues[0].message,
                        } satisfies ActionResult;
                    }

                    return redirect('/success');
                },
            },
            {
                path: '/success',
                element: <p data-testid="redirect-success">Profile updated successfully.</p>,
            },
        ]),
    );

    return <RouterProvider router={router} />;
};

const meta = {
    title: 'Account/ProfileSection',
    component: ProfileSectionHarness,
    tags: ['autodocs'],
    parameters: {
        layout: 'centered',
        usesDataRouter: true,
        docs: {
            description: {
                component: profileSectionDescription,
            },
        },
    },
} satisfies Meta<typeof ProfileSectionHarness>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

export const RejectsEmptyFirstName: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.clear(canvas.getByLabelText(/first name/i));
        await userEvent.click(canvas.getByRole('button', { name: /update profile/i }));
        await expect(canvas.getByText(/first name is required/i)).toBeInTheDocument();
    },
};

export const RejectsEmptyLastName: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.clear(canvas.getByLabelText(/last name/i));
        await userEvent.click(canvas.getByRole('button', { name: /update profile/i }));
        await expect(canvas.getByText(/last name is required/i)).toBeInTheDocument();
    },
};

export const AcceptsValidProfile: Story = {
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);
        await userEvent.clear(canvas.getByLabelText(/first name/i));
        await userEvent.type(canvas.getByLabelText(/first name/i), 'Janet');
        await userEvent.click(canvas.getByRole('button', { name: /update profile/i }));
        await expect(canvas.getByTestId('redirect-success')).toBeInTheDocument();
    },
};
