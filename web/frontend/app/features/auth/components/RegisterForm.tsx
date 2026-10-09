import { BaseSyntheticEvent, useState } from 'react';
import { FormState, UseFormRegister } from 'react-hook-form';
import FormField from '../../../components/ui/forms/FormField';
import SubmitButton from '../../../components/ui/forms/SubmitButton';
import type { RegisterSchema } from '../schemas';
import ShowPasswordToggle from './ShowPasswordToggle';

interface RegisterFormProps {
    onSubmit: (e?: BaseSyntheticEvent) => Promise<Awaited<void> | undefined>;
    formState: FormState<RegisterSchema>;
    register: UseFormRegister<RegisterSchema>;
    submitting: boolean;
}

const RegisterForm = (props: RegisterFormProps) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form onSubmit={props.onSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2">
                <FormField
                    id="firstName"
                    type="text"
                    autoComplete="given-name"
                    label="First name"
                    error={props.formState.errors.firstName?.message}
                    {...props.register('firstName')}
                />

                <FormField
                    id="lastName"
                    type="text"
                    autoComplete="family-name"
                    label="Last name"
                    error={props.formState.errors.lastName?.message}
                    {...props.register('lastName')}
                />
            </div>

            <FormField
                id="username"
                type="text"
                autoComplete="username"
                label="Username"
                hint="3-64 characters, alphanumeric and . _ -"
                error={props.formState.errors.username?.message}
                {...props.register('username')}
            />

            <FormField
                id="email"
                type="email"
                autoComplete="email"
                label="Email"
                error={props.formState.errors.email?.message}
                {...props.register('email')}
            />

            <FormField
                id="dateOfBirth"
                type="date"
                label="Date of birth"
                hint="Must be 19 years or older."
                error={props.formState.errors.dateOfBirth?.message}
                {...props.register('dateOfBirth')}
            />

            <FormField
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                label="Password"
                hint="8+ chars: uppercase, lowercase, digit, special character"
                error={props.formState.errors.password?.message}
                {...props.register('password')}
            />

            <FormField
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                label="Confirm password"
                error={props.formState.errors.confirmPassword?.message}
                {...props.register('confirmPassword')}
            />

            <ShowPasswordToggle
                shown={showPassword}
                onToggle={() => setShowPassword((shown) => !shown)}
            />

            <SubmitButton
                isSubmitting={props.submitting}
                idleText="Create account"
                submittingText="Creating account…"
                className="btn btn-primary min-h-12 w-full"
            />
        </form>
    );
};

export default RegisterForm;
