import { BaseSyntheticEvent, useState } from 'react';
import { FormState, UseFormRegister } from 'react-hook-form';
import FormField from '../../../components/ui/forms/FormField';
import SubmitButton from '../../../components/ui/forms/SubmitButton';
import type { LoginSchema } from '../schemas';
import ShowPasswordToggle from './ShowPasswordToggle';

interface LoginFormProps {
    onSubmit: (e?: BaseSyntheticEvent) => Promise<Awaited<void> | undefined>;
    formState: FormState<LoginSchema>;
    register: UseFormRegister<{ username: string; password: string }>;
    submitting: boolean;
}

const LoginForm = (props: LoginFormProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={props.onSubmit} className="flex flex-col gap-4">
            <FormField
                id="username"
                type="text"
                autoComplete="username"
                label="Username"
                error={props.formState.errors.username?.message}
                {...props.register('username')}
            />

            <FormField
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                label="Password"
                error={props.formState.errors.password?.message}
                {...props.register('password')}
            />

            <ShowPasswordToggle
                shown={showPassword}
                onToggle={() => setShowPassword((shown) => !shown)}
            />

            <SubmitButton
                isSubmitting={props.submitting}
                idleText="Sign in"
                submittingText="Signing in…"
                className="btn btn-primary min-h-12 w-full"
            />
        </form>
    );
};

export default LoginForm;
