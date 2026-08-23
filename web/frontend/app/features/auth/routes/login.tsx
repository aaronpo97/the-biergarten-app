import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn } from 'iconoir-react';
import { useForm } from 'react-hook-form';
import { redirect, useNavigation, useSubmit } from 'react-router';
import { createAuthSession, getOptionalAuth, login } from '../auth.server';
import LoginForm from '../components/LoginForm';
import RegisterCallout from '../components/RegisterCallout';
import { useActionErrorToast } from '../hooks/useActionErrorToast';
import { loginSchema, type LoginSchema } from '../schemas';
import type { Route } from './+types/login';

export const meta = ({}: Route.MetaArgs) => {
    return [{ title: 'Login | The Biergarten App' }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const auth = await getOptionalAuth(request);
    if (auth) throw redirect('/dashboard');
    return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
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
};

const Login = ({ actionData }: Route.ComponentProps) => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const isSubmitting = navigation.state === 'submitting';

    const { register, handleSubmit, formState } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = handleSubmit((data) => {
        submit(data, { method: 'post' });
    });

    useActionErrorToast(actionData?.error);

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

                    <LoginForm
                        onSubmit={onSubmit}
                        formState={formState}
                        register={register}
                        submitting={isSubmitting}
                    />

                    <RegisterCallout />
                </div>
            </div>
        </div>
    );
};

export default Login;
