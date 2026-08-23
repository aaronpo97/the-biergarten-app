import { Settings } from 'iconoir-react';
import { useReducer } from 'react';
import { data, Link, redirect } from 'react-router';
import {
    commitSession,
    deleteAccount,
    destroySession,
    getSession,
    getUserAccount,
    requireAuth,
    updateEmail,
    updatePassword,
    updateProfile,
    updateUsername,
} from '../../auth/auth.server';
import DeleteAccountSection from '../components/DeleteAccountSection';
import EmailSection from '../components/EmailSection';
import PasswordSection from '../components/PasswordSection';
import ProfileSection from '../components/ProfileSection';
import UsernameSection from '../components/UsernameSection';
import {
    updateEmailSchema,
    updatePasswordSchema,
    updateProfileSchema,
    updateUsernameSchema,
} from '../schemas';
import { initialSectionState, sectionReducer } from '../state';
import type { ActionResult } from '../types';

import type { Route } from './+types/account';

export const meta = ({}: Route.MetaArgs) => [{ title: 'Account Settings | The Biergarten App' }];

export const loader = async ({ request }: Route.LoaderArgs) => {
    const auth = await requireAuth(request);

    let details = { firstName: '', lastName: '', email: '', dateOfBirth: '' };
    try {
        const account = await getUserAccount(auth.userAccountId);
        details = {
            firstName: account.firstName,
            lastName: account.lastName,
            email: account.email,
            // Trim the backend's ISO datetime down to the yyyy-MM-dd a date input expects.
            dateOfBirth: account.dateOfBirth.slice(0, 10),
        };
    } catch {
        // Fall through with blank fields; the update forms still work standalone.
    }

    return { username: auth.username, userAccountId: auth.userAccountId, ...details };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const auth = await requireAuth(request);
    const formData = await request.formData();
    const intent = formData.get('intent');

    if (intent === 'delete') {
        try {
            await deleteAccount(auth.accessToken);
        } catch (err) {
            return {
                intent: 'delete' as const,
                success: false as const,
                error: err instanceof Error ? err.message : 'Failed to delete account.',
            };
        }
        const session = await getSession(request);
        return redirect('/', { headers: { 'Set-Cookie': await destroySession(session) } });
    }

    if (intent === 'username') {
        const result = updateUsernameSchema.safeParse({ newUsername: formData.get('newUsername') });
        if (!result.success)
            return { intent, success: false, error: result.error.issues[0].message } as const;

        try {
            const payload = await updateUsername(auth.accessToken, result.data.newUsername);
            const session = await getSession(request);
            session.set('username', payload.username);
            return data({ intent, success: true, username: payload.username } as const, {
                headers: { 'Set-Cookie': await commitSession(session) },
            });
        } catch (err) {
            return {
                intent,
                success: false,
                error: err instanceof Error ? err.message : 'Failed to update username.',
            } as const;
        }
    }

    if (intent === 'email') {
        const result = updateEmailSchema.safeParse({ newEmail: formData.get('newEmail') });
        if (!result.success)
            return { intent, success: false, error: result.error.issues[0].message } as const;

        try {
            const payload = await updateEmail(auth.accessToken, result.data.newEmail);
            return {
                intent,
                success: true,
                email: payload.email,
                emailConfirmed: payload.emailConfirmed,
            } as const;
        } catch (err) {
            return {
                intent,
                success: false,
                error: err instanceof Error ? err.message : 'Failed to update email.',
            } as const;
        }
    }

    if (intent === 'profile') {
        const result = updateProfileSchema.safeParse({
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            dateOfBirth: formData.get('dateOfBirth'),
        });
        if (!result.success)
            return { intent, success: false, error: result.error.issues[0].message } as const;

        try {
            const payload = await updateProfile(
                auth.accessToken,
                result.data.firstName,
                result.data.lastName,
                result.data.dateOfBirth,
            );
            return {
                intent,
                success: true,
                firstName: payload.firstName,
                lastName: payload.lastName,
                dateOfBirth: payload.dateOfBirth.slice(0, 10),
            } as const;
        } catch (err) {
            return {
                intent,
                success: false,
                error: err instanceof Error ? err.message : 'Failed to update profile.',
            } as const;
        }
    }

    if (intent === 'password') {
        const result = updatePasswordSchema.safeParse({
            currentPassword: formData.get('currentPassword'),
            newPassword: formData.get('newPassword'),
            confirmNewPassword: formData.get('confirmNewPassword'),
        });
        if (!result.success)
            return { intent, success: false, error: result.error.issues[0].message } as const;

        try {
            await updatePassword(
                auth.accessToken,
                result.data.currentPassword,
                result.data.newPassword,
            );
            return { intent, success: true } as const;
        } catch (err) {
            return {
                intent,
                success: false,
                error: err instanceof Error ? err.message : 'Failed to update password.',
            } as const;
        }
    }

    throw data('Unknown request.', { status: 400 });
};

const AccountPage = ({ loaderData, actionData }: Route.ComponentProps) => {
    const { username, userAccountId, firstName, lastName, email, dateOfBirth } = loaderData;
    const result = actionData as ActionResult | undefined;

    const [sections, dispatch] = useReducer(sectionReducer, initialSectionState);
    const closeAll = () => dispatch({ type: 'CLOSE_ALL' });

    return (
        <div className="min-h-screen bg-base-200">
            <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
                <div className="flex items-center gap-3">
                    <Settings className="size-7" aria-hidden="true" />
                    <div>
                        <h1 className="text-3xl font-bold">Account Settings</h1>
                        <p className="text-base-content/70">
                            Manage the account details for{' '}
                            <span className="font-mono">{username}</span>
                        </p>
                    </div>
                </div>

                <UsernameSection
                    username={username}
                    open={sections.usernameOpen}
                    onToggle={() => dispatch({ type: 'TOGGLE_USERNAME_VISIBILITY' })}
                    onSuccess={closeAll}
                    result={result}
                />

                <EmailSection
                    email={email}
                    open={sections.emailOpen}
                    onToggle={() => dispatch({ type: 'TOGGLE_EMAIL_VISIBILITY' })}
                    onSuccess={closeAll}
                    result={result}
                />

                <ProfileSection
                    firstName={firstName}
                    lastName={lastName}
                    dateOfBirth={dateOfBirth}
                    open={sections.profileOpen}
                    onToggle={() => dispatch({ type: 'TOGGLE_PROFILE_VISIBILITY' })}
                    onSuccess={closeAll}
                    result={result}
                />

                <PasswordSection
                    open={sections.passwordOpen}
                    onToggle={() => dispatch({ type: 'TOGGLE_PASSWORD_VISIBILITY' })}
                    onSuccess={closeAll}
                    result={result}
                />

                <DeleteAccountSection userAccountId={userAccountId} result={result} />

                <Link
                    to="/dashboard"
                    className="link link-hover text-sm text-base-content/60 inline-block"
                >
                    ← Back to dashboard
                </Link>
            </div>
        </div>
    );
};

export default AccountPage;
