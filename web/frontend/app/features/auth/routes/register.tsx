import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { redirect, useNavigation, useSubmit } from 'react-router';
import { createAuthSession, getOptionalAuth, register } from '../auth.server';
import LoginCallout from '../components/LoginCallout';
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
        <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
            <div className="card w-full max-w-lg bg-base-100 shadow-xl">
                <div className="card-body gap-4">
                    <div className="text-center">
                        <h1 className="card-title text-3xl justify-center">Register</h1>
                        <p className="text-base-content/70">Create your Biergarten account</p>
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

                    <LoginCallout />
                </div>
            </div>
        </div>
    );
};

export default Register;
