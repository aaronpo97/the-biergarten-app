import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { redirect, useNavigation, useSubmit } from 'react-router';
import { createAuthSession, getOptionalAuth, login } from '../auth.server';
import AuthCardHeading from '../components/layout/AuthCardHeading';
import AuthErrorAlert from '../components/feedback/AuthErrorAlert';
import AuthSplitLayout from '../components/layout/AuthSplitLayout';
import AuthSwitchPrompt from '../components/layout/AuthSwitchPrompt';
import LoginForm from '../components/forms/LoginForm';
import { useActionErrorToast } from '../hooks/useActionErrorToast';
import { loginSchema, type LoginSchema } from '../schemas';
import type { Route } from './+types/login';

export const meta = ({}: Route.MetaArgs) => {
    return [
        { title: 'Login | The Biergarten App' },
        {
            name: 'description',
            content:
                'Log in to The Biergarten App to rate breweries and keep track of the beers you have tried.',
        },
    ];
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
            <AuthCardHeading title="Sign in" subtitle="Sign in to your Biergarten account" />

            {actionData?.error && <AuthErrorAlert message={actionData.error} />}

            <LoginForm
                onSubmit={onSubmit}
                formState={formState}
                register={register}
                submitting={isSubmitting}
            />

            <AuthSwitchPrompt lead="New to Biergarten?" to="/register" label="Create an account" />
        </AuthSplitLayout>
    );
};

export default Login;
