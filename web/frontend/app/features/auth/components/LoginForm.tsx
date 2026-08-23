import { BaseSyntheticEvent } from 'react';
import { FormState, UseFormRegister } from 'react-hook-form';
import FormField from '../../../components/ui/forms/FormField';
import SubmitButton from '../../../components/ui/forms/SubmitButton';
import type { LoginSchema } from '../schemas';

interface LoginFormProps {
    onSubmit: (e?: BaseSyntheticEvent) => Promise<Awaited<void> | undefined>;
    formState: FormState<LoginSchema>;
    register: UseFormRegister<{ username: string; password: string }>;
    submitting: boolean;
}

const LoginForm = (props: LoginFormProps) => (
    <form onSubmit={props.onSubmit} className="space-y-3">
        <FormField
            id="username"
            type="text"
            autoComplete="username"
            placeholder="your_username"
            label="Username"
            error={props.formState.errors.username?.message}
            {...props.register('username')}
        />

        <FormField
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            label="Password"
            error={props.formState.errors.password?.message}
            {...props.register('password')}
        />

        <SubmitButton
            isSubmitting={props.submitting}
            idleText="Sign In"
            submittingText="Signing in..."
        />
    </form>
);

export default LoginForm;
