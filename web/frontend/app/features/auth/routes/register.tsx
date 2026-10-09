import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { redirect, useNavigation, useSubmit } from 'react-router';
import { createAuthSession, getOptionalAuth, register } from '../auth.server';
import AuthSplitLayout from '../components/AuthSplitLayout';
import AuthSwitchPrompt from '../components/AuthSwitchPrompt';
import RegisterForm from '../components/RegisterForm';
import { useActionErrorToast } from '../hooks/useActionErrorToast';
import { registerSchema, type RegisterSchema } from '../schemas';
import type { Route } from './+types/register';

export const meta = ({}: Route.MetaArgs) => {
    return [{ title: 'Register | The Biergarten App' }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const auth = await getOptionalAuth(request);
    if (auth) throw redirect('/dashboard');
    return null;
};

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const result = registerSchema.safeParse({
        username: formData.get('username'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        dateOfBirth: formData.get('dateOfBirth'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
    });

    if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors as Record<
            keyof RegisterSchema,
            string[] | undefined
        >;
        return { error: null, fieldErrors };
    }

    try {
        const body = {
            username: result.data.username,
            firstName: result.data.firstName,
            lastName: result.data.lastName,
            email: result.data.email,
            dateOfBirth: result.data.dateOfBirth,
            password: result.data.password,
        };
        const payload = await register(body);
        return createAuthSession(payload, '/dashboard');
    } catch (err) {
        return {
            error: err instanceof Error ? err.message : 'Registration failed.',
            fieldErrors: null,
        };
    }
};

const Register = ({ actionData }: Route.ComponentProps) => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const isSubmitting = navigation.state === 'submitting';

    const {
        register: field,
        handleSubmit,
        formState,
    } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });

    const onSubmit = handleSubmit((data) => {
        submit(data, { method: 'post' });
    });

    useActionErrorToast(actionData?.error);

    return (
        <AuthSplitLayout
            headline="Pull up a chair."
            blurb="Create an account to explore partner breweries and their beers."
        >
            <div className="flex w-full max-w-[32.5rem] flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <h1 className="text-[2.125rem]">Create your account</h1>
                    <p className="text-[var(--color-muted)]">Create your Biergarten account</p>
                </div>

                {actionData?.error && (
                    <div role="alert" className="alert alert-error alert-soft">
                        <span>{actionData.error}</span>
                    </div>
                )}

                <RegisterForm
                    onSubmit={onSubmit}
                    formState={formState}
                    register={field}
                    submitting={isSubmitting}
                />

                <AuthSwitchPrompt lead="Already have an account?" to="/login" label="Sign in" />
            </div>
        </AuthSplitLayout>
    );
};

export default Register;
