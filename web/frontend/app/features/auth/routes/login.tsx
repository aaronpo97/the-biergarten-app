import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { redirect, useNavigation, useSubmit } from 'react-router';
import { createAuthSession, getOptionalAuth, login } from '../auth.server';
import AuthSplitLayout from '../components/AuthSplitLayout';
import AuthSwitchPrompt from '../components/AuthSwitchPrompt';
import LoginForm from '../components/LoginForm';
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
        <AuthSplitLayout
            headline="Good to see you again."
            blurb="Sign in to pick up where you left off with our partner breweries."
        >
            <div className="flex w-full max-w-[25rem] flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-[2.125rem]">Sign in</h1>
                    <p className="text-[var(--color-muted)]">Sign in to your Biergarten account</p>
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

                <AuthSwitchPrompt
                    lead="New to Biergarten?"
                    to="/register"
                    label="Create an account"
                />
            </div>
        </AuthSplitLayout>
    );
};

export default Login;
