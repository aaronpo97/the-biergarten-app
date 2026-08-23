import { Settings } from 'iconoir-react';
import { useEffect, useReducer, useState } from 'react';
import { data, Link, redirect, useSearchParams } from 'react-router';
import { showSuccessToast } from '../../../components/ui/toast/toast';
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

const redirectWithToast = (message: string, headers?: HeadersInit) =>
    redirect(`/account?toast=${encodeURIComponent(message)}`, headers ? { headers } : undefined);

export const action = async ({ request }: Route.ActionArgs) => {
    const auth = await requireAuth(request);
    const formData = await request.formData();
    const intent = formData.get('intent');

    switch (intent) {
        case 'delete': {
            try {
                await deleteAccount(auth.accessToken);
            } catch (err) {
                return {
                    intent: 'delete' as const,
                    error: err instanceof Error ? err.message : 'Failed to delete account.',
                };
            }
            const session = await getSession(request);
            return redirect('/', { headers: { 'Set-Cookie': await destroySession(session) } });
        }

        case 'username': {
            const result = updateUsernameSchema.safeParse({
                newUsername: formData.get('newUsername'),
            });
            if (!result.success) return { intent, error: result.error.issues[0].message } as const;

            try {
                const payload = await updateUsername(auth.accessToken, result.data.newUsername);
                const session = await getSession(request);
                session.set('username', payload.username);
                return redirectWithToast('Username updated successfully.', {
                    'Set-Cookie': await commitSession(session),
                });
            } catch (err) {
                return {
                    intent,
                    error: err instanceof Error ? err.message : 'Failed to update username.',
                } as const;
            }
        }

        case 'email': {
            const result = updateEmailSchema.safeParse({ newEmail: formData.get('newEmail') });
            if (!result.success) return { intent, error: result.error.issues[0].message } as const;

            try {
                const payload = await updateEmail(auth.accessToken, result.data.newEmail);
                return redirectWithToast(
                    payload.emailConfirmed
                        ? 'Email updated successfully.'
                        : 'Email updated. Please re-confirm your new address.',
                );
            } catch (err) {
                return {
                    intent,
                    error: err instanceof Error ? err.message : 'Failed to update email.',
                } as const;
            }
        }

        case 'profile': {
            const result = updateProfileSchema.safeParse({
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                dateOfBirth: formData.get('dateOfBirth'),
            });
            if (!result.success) return { intent, error: result.error.issues[0].message } as const;

            try {
                await updateProfile(
                    auth.accessToken,
                    result.data.firstName,
                    result.data.lastName,
                    result.data.dateOfBirth,
                );
                return redirectWithToast('Profile updated successfully.');
            } catch (err) {
                return {
                    intent,
                    error: err instanceof Error ? err.message : 'Failed to update profile.',
                } as const;
            }
        }

        case 'password': {
            const result = updatePasswordSchema.safeParse({
                currentPassword: formData.get('currentPassword'),
                newPassword: formData.get('newPassword'),
                confirmNewPassword: formData.get('confirmNewPassword'),
            });
            if (!result.success) return { intent, error: result.error.issues[0].message } as const;

            try {
                await updatePassword(
                    auth.accessToken,
                    result.data.currentPassword,
                    result.data.newPassword,
                );
                return redirectWithToast('Password changed successfully.');
            } catch (err) {
                return {
                    intent,
                    error: err instanceof Error ? err.message : 'Failed to update password.',
                } as const;
            }
        }

        default:
            throw data('Unknown request.', { status: 400 });
    }
};

const AccountPage = ({ loaderData, actionData }: Route.ComponentProps) => {
    const { username, userAccountId, firstName, lastName, email, dateOfBirth } = loaderData;
    const result = actionData as ActionResult | undefined;

    const [sections, dispatch] = useReducer(sectionReducer, initialSectionState);
    // Bumped once per successful update so the section subtree below remounts
    // with fresh `key`s, picking up the new loader values (and, for
    // PasswordSection, clearing fields that have no persisted value to key
    // off) without needing an effect to imperatively reset each form.
    const [resetKey, setResetKey] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const toast = searchParams.get('toast');

    // Collapsing the sections and bumping resetKey are state adjustments in
    // response to a changed prop (the `toast` search param), so they happen
    // directly during render - React's documented alternative to an effect
    // for this case - guarded by `handledToast` so it only runs once per
    // redirect. Showing the toast and clearing the param are genuine side
    // effects on an external system (react-hot-toast, the URL) and stay in
    // the effect below.
    const [handledToast, setHandledToast] = useState<string | null>(null);
    if (toast && toast !== handledToast) {
        setHandledToast(toast);
        dispatch({ type: 'CLOSE_ALL' });
        setResetKey((key) => key + 1);
    }

    useEffect(() => {
        if (!toast) return;
        showSuccessToast(toast);
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete('toast');
                return next;
            },
            { replace: true },
        );
    }, [toast, setSearchParams]);

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
                    key={`username-${resetKey}`}
                    username={username}
                    open={sections.usernameOpen}
                    onToggle={() => dispatch({ type: 'TOGGLE_USERNAME_VISIBILITY' })}
                    result={result}
                />

                <EmailSection
                    key={`email-${resetKey}`}
                    email={email}
                    open={sections.emailOpen}
                    onToggle={() => dispatch({ type: 'TOGGLE_EMAIL_VISIBILITY' })}
                    result={result}
                />

                <ProfileSection
                    key={`profile-${resetKey}`}
                    firstName={firstName}
                    lastName={lastName}
                    dateOfBirth={dateOfBirth}
                    open={sections.profileOpen}
                    onToggle={() => dispatch({ type: 'TOGGLE_PROFILE_VISIBILITY' })}
                    result={result}
                />

                <PasswordSection
                    key={`password-${resetKey}`}
                    open={sections.passwordOpen}
                    onToggle={() => dispatch({ type: 'TOGGLE_PASSWORD_VISIBILITY' })}
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
