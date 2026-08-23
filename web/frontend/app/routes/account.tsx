import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react';
import { Lock, Mail, Settings, Trash, User, WarningTriangle } from 'iconoir-react';
import { useEffect, useReducer, useState } from 'react';
import { useForm } from 'react-hook-form';
import { data, Link, redirect, useNavigation, useSubmit } from 'react-router';
import FormField from '../components/forms/FormField';
import SubmitButton from '../components/forms/SubmitButton';
import { showErrorToast, showSuccessToast } from '../components/toast/toast';
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
} from '../lib/auth.server';
import {
   updateEmailSchema,
   updatePasswordSchema,
   updateProfileSchema,
   updateUsernameSchema,
   type UpdateEmailSchema,
   type UpdatePasswordSchema,
   type UpdateProfileSchema,
   type UpdateUsernameSchema,
} from '../lib/schemas';
import type { Route } from './+types/account';

export function meta({}: Route.MetaArgs) {
   return [{ title: 'Account Settings | The Biergarten App' }];
}

export async function loader({ request }: Route.LoaderArgs) {
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
}

type ActionResult =
   | { intent: 'username'; success: true; username: string }
   | { intent: 'username'; success: false; error: string }
   | { intent: 'email'; success: true; email: string; emailConfirmed: boolean }
   | { intent: 'email'; success: false; error: string }
   | {
        intent: 'profile';
        success: true;
        firstName: string;
        lastName: string;
        dateOfBirth: string;
     }
   | { intent: 'profile'; success: false; error: string }
   | { intent: 'password'; success: true }
   | { intent: 'password'; success: false; error: string }
   | { intent: 'delete'; success: false; error: string };

export async function action({ request }: Route.ActionArgs) {
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
         return data(
            { intent, success: true, username: payload.username } as const,
            { headers: { 'Set-Cookie': await commitSession(session) } }
         );
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
            result.data.dateOfBirth
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
            result.data.newPassword
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
}

interface SectionState {
   usernameOpen: boolean;
   emailOpen: boolean;
   profileOpen: boolean;
   passwordOpen: boolean;
}

type SectionAction =
   | { type: 'TOGGLE_USERNAME_VISIBILITY' }
   | { type: 'TOGGLE_EMAIL_VISIBILITY' }
   | { type: 'TOGGLE_PROFILE_VISIBILITY' }
   | { type: 'TOGGLE_PASSWORD_VISIBILITY' }
   | { type: 'CLOSE_ALL' };

const initialSectionState: SectionState = {
   usernameOpen: false,
   emailOpen: false,
   profileOpen: false,
   passwordOpen: false,
};

function sectionReducer(state: SectionState, action: SectionAction): SectionState {
   switch (action.type) {
      case 'TOGGLE_USERNAME_VISIBILITY':
         return { ...initialSectionState, usernameOpen: !state.usernameOpen };
      case 'TOGGLE_EMAIL_VISIBILITY':
         return { ...initialSectionState, emailOpen: !state.emailOpen };
      case 'TOGGLE_PROFILE_VISIBILITY':
         return { ...initialSectionState, profileOpen: !state.profileOpen };
      case 'TOGGLE_PASSWORD_VISIBILITY':
         return { ...initialSectionState, passwordOpen: !state.passwordOpen };
      case 'CLOSE_ALL':
         return initialSectionState;
      default:
         return state;
   }
}

function SectionCard({
   icon,
   title,
   description,
   open,
   onToggle,
   children,
}: {
   icon: React.ReactNode;
   title: string;
   description: string;
   open: boolean;
   onToggle: () => void;
   children: React.ReactNode;
}) {
   return (
      <div className="card bg-base-100 shadow">
         <div className="card-body">
            <div className="flex w-full items-center justify-between gap-5">
               <div className="flex items-start gap-3">
                  <span className="text-base-content/60 mt-1">{icon}</span>
                  <div>
                     <h2 className="card-title text-lg">{title}</h2>
                     <p className="text-sm text-base-content/70">{description}</p>
                  </div>
               </div>
               <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  checked={open}
                  onChange={onToggle}
                  aria-label={`Toggle ${title.toLowerCase()} form`}
               />
            </div>
            {open && <div className="mt-4">{children}</div>}
         </div>
      </div>
   );
}

export default function Account({ loaderData, actionData }: Route.ComponentProps) {
   const { username, userAccountId, firstName, lastName, email, dateOfBirth } = loaderData;
   const result = actionData as ActionResult | undefined;
   const navigation = useNavigation();
   const submit = useSubmit();
   const submittingIntent = navigation.formData?.get('intent');

   const [sections, dispatch] = useReducer(sectionReducer, initialSectionState);
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

   const usernameForm = useForm<UpdateUsernameSchema>({
      resolver: zodResolver(updateUsernameSchema),
      defaultValues: { newUsername: username },
   });
   const emailForm = useForm<UpdateEmailSchema>({
      resolver: zodResolver(updateEmailSchema),
      defaultValues: { newEmail: email },
   });
   const profileForm = useForm<UpdateProfileSchema>({
      resolver: zodResolver(updateProfileSchema),
      defaultValues: { firstName, lastName, dateOfBirth },
   });
   const passwordForm = useForm<UpdatePasswordSchema>({ resolver: zodResolver(updatePasswordSchema) });

   useEffect(() => {
      if (!result) return;

      if (result.intent === 'username') {
         if (!result.success) {
            showErrorToast(result.error);
            return;
         }
         showSuccessToast('Username updated successfully.');
         dispatch({ type: 'CLOSE_ALL' });
         usernameForm.reset({ newUsername: result.username });
      } else if (result.intent === 'email') {
         if (!result.success) {
            showErrorToast(result.error);
            return;
         }
         showSuccessToast(
            result.emailConfirmed
               ? 'Email updated successfully.'
               : 'Email updated. Please re-confirm your new address.'
         );
         dispatch({ type: 'CLOSE_ALL' });
         emailForm.reset({ newEmail: result.email });
      } else if (result.intent === 'profile') {
         if (!result.success) {
            showErrorToast(result.error);
            return;
         }
         showSuccessToast('Profile updated successfully.');
         dispatch({ type: 'CLOSE_ALL' });
         profileForm.reset({
            firstName: result.firstName,
            lastName: result.lastName,
            dateOfBirth: result.dateOfBirth,
         });
      } else if (result.intent === 'password') {
         if (!result.success) {
            showErrorToast(result.error);
            return;
         }
         showSuccessToast('Password changed successfully.');
         dispatch({ type: 'CLOSE_ALL' });
         passwordForm.reset();
      } else if (result.intent === 'delete') {
         showErrorToast(result.error);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [result]);

   return (
      <div className="min-h-screen bg-base-200">
         <div className="mx-auto max-w-2xl px-6 py-10 space-y-6">
            <div className="flex items-center gap-3">
               <Settings className="size-7" aria-hidden="true" />
               <div>
                  <h1 className="text-3xl font-bold">Account Settings</h1>
                  <p className="text-base-content/70">
                     Manage the account details for <span className="font-mono">{username}</span>
                  </p>
               </div>
            </div>

            <SectionCard
               icon={<User className="size-5" aria-hidden="true" />}
               title="Username"
               description="Change the username you sign in with."
               open={sections.usernameOpen}
               onToggle={() => dispatch({ type: 'TOGGLE_USERNAME_VISIBILITY' })}
            >
               <form
                  className="space-y-3"
                  onSubmit={usernameForm.handleSubmit((values) =>
                     submit({ ...values, intent: 'username' }, { method: 'post' })
                  )}
               >
                  <FormField
                     id="newUsername"
                     type="text"
                     placeholder={username}
                     label="New Username"
                     error={usernameForm.formState.errors.newUsername?.message}
                     {...usernameForm.register('newUsername')}
                  />
                  <SubmitButton
                     isSubmitting={submittingIntent === 'username'}
                     idleText="Update Username"
                     submittingText="Updating..."
                  />
               </form>
            </SectionCard>

            <SectionCard
               icon={<Mail className="size-5" aria-hidden="true" />}
               title="Email Address"
               description="Change your email. You'll need to re-confirm the new address."
               open={sections.emailOpen}
               onToggle={() => dispatch({ type: 'TOGGLE_EMAIL_VISIBILITY' })}
            >
               <form
                  className="space-y-3"
                  onSubmit={emailForm.handleSubmit((values) =>
                     submit({ ...values, intent: 'email' }, { method: 'post' })
                  )}
               >
                  <FormField
                     id="newEmail"
                     type="email"
                     autoComplete="email"
                     placeholder="jane@example.com"
                     label="New Email"
                     error={emailForm.formState.errors.newEmail?.message}
                     {...emailForm.register('newEmail')}
                  />
                  <SubmitButton
                     isSubmitting={submittingIntent === 'email'}
                     idleText="Update Email"
                     submittingText="Updating..."
                  />
               </form>
            </SectionCard>

            <SectionCard
               icon={<User className="size-5" aria-hidden="true" />}
               title="Profile"
               description="Update your name and date of birth."
               open={sections.profileOpen}
               onToggle={() => dispatch({ type: 'TOGGLE_PROFILE_VISIBILITY' })}
            >
               <form
                  className="space-y-3"
                  onSubmit={profileForm.handleSubmit((values) =>
                     submit({ ...values, intent: 'profile' }, { method: 'post' })
                  )}
               >
                  <div className="grid grid-cols-2 gap-3">
                     <FormField
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        placeholder="Jane"
                        label="First Name"
                        error={profileForm.formState.errors.firstName?.message}
                        {...profileForm.register('firstName')}
                     />
                     <FormField
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        placeholder="Doe"
                        label="Last Name"
                        error={profileForm.formState.errors.lastName?.message}
                        {...profileForm.register('lastName')}
                     />
                  </div>
                  <FormField
                     id="dateOfBirth"
                     type="date"
                     label="Date of Birth"
                     error={profileForm.formState.errors.dateOfBirth?.message}
                     {...profileForm.register('dateOfBirth')}
                  />
                  <SubmitButton
                     isSubmitting={submittingIntent === 'profile'}
                     idleText="Update Profile"
                     submittingText="Updating..."
                  />
               </form>
            </SectionCard>

            <SectionCard
               icon={<Lock className="size-5" aria-hidden="true" />}
               title="Password"
               description="Change the password used to sign in."
               open={sections.passwordOpen}
               onToggle={() => dispatch({ type: 'TOGGLE_PASSWORD_VISIBILITY' })}
            >
               <form
                  className="space-y-3"
                  onSubmit={passwordForm.handleSubmit((values) =>
                     submit({ ...values, intent: 'password' }, { method: 'post' })
                  )}
               >
                  <FormField
                     id="currentPassword"
                     type="password"
                     autoComplete="current-password"
                     placeholder="••••••••"
                     label="Current Password"
                     error={passwordForm.formState.errors.currentPassword?.message}
                     {...passwordForm.register('currentPassword')}
                  />
                  <FormField
                     id="newPassword"
                     type="password"
                     autoComplete="new-password"
                     placeholder="••••••••"
                     label="New Password"
                     hint="8+ chars: uppercase, lowercase, digit, special character"
                     error={passwordForm.formState.errors.newPassword?.message}
                     {...passwordForm.register('newPassword')}
                  />
                  <FormField
                     id="confirmNewPassword"
                     type="password"
                     autoComplete="new-password"
                     placeholder="••••••••"
                     label="Confirm New Password"
                     error={passwordForm.formState.errors.confirmNewPassword?.message}
                     {...passwordForm.register('confirmNewPassword')}
                  />
                  <SubmitButton
                     isSubmitting={submittingIntent === 'password'}
                     idleText="Change Password"
                     submittingText="Changing..."
                  />
               </form>
            </SectionCard>

            <div className="card bg-error/5 border border-error/30 shadow">
               <div className="card-body">
                  <div className="flex items-center justify-between gap-5">
                     <div className="flex items-start gap-3">
                        <span className="text-error mt-1">
                           <Trash className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                           <h2 className="card-title text-lg">Delete Account</h2>
                           <p className="text-sm text-base-content/70">
                              Permanently delete your account. This cannot be undone.
                           </p>
                        </div>
                     </div>
                     <button
                        type="button"
                        className="btn btn-error btn-outline btn-sm"
                        onClick={() => setDeleteDialogOpen(true)}
                     >
                        Delete
                     </button>
                  </div>
               </div>
            </div>

            <Link
               to="/dashboard"
               className="link link-hover text-sm text-base-content/60 inline-block"
            >
               ← Back to dashboard
            </Link>
         </div>

         <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            className="relative z-50"
         >
            <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
               <DialogPanel className="card w-full max-w-sm bg-base-100 shadow-xl">
                  <div className="card-body items-center text-center gap-3">
                     <WarningTriangle className="size-10 text-error" aria-hidden="true" />
                     <DialogTitle className="text-lg font-bold">
                        Delete your account?
                     </DialogTitle>
                     <p className="text-sm text-base-content/70">
                        This action is permanent and cannot be reversed. Account ID{' '}
                        <span className="font-mono text-xs">{userAccountId}</span> and all
                        associated data will be removed.
                     </p>
                     <div className="flex flex-col gap-2 w-full pt-2">
                        <button
                           type="button"
                           className="btn btn-error btn-sm w-full"
                           disabled={submittingIntent === 'delete'}
                           onClick={() => submit({ intent: 'delete' }, { method: 'post' })}
                        >
                           {submittingIntent === 'delete' ? (
                              <>
                                 <span className="loading loading-spinner loading-sm" /> Deleting...
                              </>
                           ) : (
                              'Yes, delete my account'
                           )}
                        </button>
                        <button
                           type="button"
                           className="btn btn-ghost btn-sm w-full"
                           onClick={() => setDeleteDialogOpen(false)}
                        >
                           Cancel
                        </button>
                     </div>
                  </div>
               </DialogPanel>
            </div>
         </Dialog>
      </div>
   );
}
