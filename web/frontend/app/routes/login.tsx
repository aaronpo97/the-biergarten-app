import { zodResolver } from '@hookform/resolvers/zod';
import { HomeSimpleDoor, LogIn, UserPlus } from 'iconoir-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, redirect, useNavigation, useSubmit } from 'react-router';
import FormField from '../components/forms/FormField';
import SubmitButton from '../components/forms/SubmitButton';
import { showErrorToast } from '../components/toast/toast';
import { createAuthSession, getOptionalAuth, login } from '../lib/auth.server';
import { loginSchema, type LoginSchema } from '../lib/schemas';
import type { Route } from './+types/login';

export function meta({}: Route.MetaArgs) {
   return [{ title: 'Login | The Biergarten App' }];
}

export async function loader({ request }: Route.LoaderArgs) {
   const auth = await getOptionalAuth(request);
   if (auth) throw redirect('/dashboard');
   return null;
}

export async function action({ request }: Route.ActionArgs) {
   const formData = await request.formData();
   const result = loginSchema.safeParse({
      username: formData.get('username'),
      password: formData.get('password'),
   });

   if (!result.success) {
      return { error: result.error.issues[0].message };
   }

   try {
      const payload = await login(result.data.username, result.data.password);
      return createAuthSession(payload, '/dashboard');
   } catch (err) {
      return { error: err instanceof Error ? err.message : 'Login failed.' };
   }
}

export default function Login({ actionData }: Route.ComponentProps) {
   const navigation = useNavigation();
   const submit = useSubmit();
   const isSubmitting = navigation.state === 'submitting';

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<LoginSchema>({ resolver: zodResolver(loginSchema) });

   const onSubmit = handleSubmit((data) => {
      submit(data, { method: 'post' });
   });

   useEffect(() => {
      if (actionData?.error) {
         showErrorToast(actionData.error);
      }
   }, [actionData?.error]);

   return (
      <div className="hero min-h-screen bg-base-200">
         <div className="card w-full max-w-md bg-base-100 shadow-xl">
            <div className="card-body gap-4">
               <div className="text-center">
                  <h1 className="card-title text-3xl justify-center gap-2">
                     <LogIn className="size-7" aria-hidden="true" />
                     Login
                  </h1>
                  <p className="text-base-content/70">Sign in to your Biergarten account</p>
               </div>

               {actionData?.error && (
                  <div role="alert" className="alert alert-error alert-soft">
                     <span>{actionData.error}</span>
                  </div>
               )}

               <form onSubmit={onSubmit} className="space-y-3">
                  <FormField
                     id="username"
                     type="text"
                     autoComplete="username"
                     placeholder="your_username"
                     label="Username"
                     error={errors.username?.message}
                     {...register('username')}
                  />

                  <FormField
                     id="password"
                     type="password"
                     autoComplete="current-password"
                     placeholder="••••••••"
                     label="Password"
                     error={errors.password?.message}
                     {...register('password')}
                  />

                  <SubmitButton
                     isSubmitting={isSubmitting}
                     idleText="Sign In"
                     submittingText="Signing in..."
                  />
               </form>

               <div className="divider text-xs">New here?</div>

               <div className="text-center space-y-2">
                  <Link to="/register" className="btn btn-outline btn-sm w-full gap-2">
                     <UserPlus className="size-4" aria-hidden="true" />
                     Create an account
                  </Link>
                  <Link
                     to="/"
                     className="link link-hover text-sm text-base-content/60 inline-flex items-center gap-1"
                  >
                     <HomeSimpleDoor className="size-4" aria-hidden="true" />
                     Back to home
                  </Link>
               </div>
            </div>
         </div>
      </div>
   );
}
