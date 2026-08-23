import { BaseSyntheticEvent } from 'react';
import { FormState, UseFormRegister } from 'react-hook-form';
import FormField from '../../../components/ui/forms/FormField';
import SubmitButton from '../../../components/ui/forms/SubmitButton';
import type { RegisterSchema } from '../schemas';

interface RegisterFormProps {
    onSubmit: (e?: BaseSyntheticEvent) => Promise<Awaited<void> | undefined>;
    formState: FormState<RegisterSchema>;
    register: UseFormRegister<RegisterSchema>;
    submitting: boolean;
}

const RegisterForm = (props: RegisterFormProps) => (
    <form onSubmit={props.onSubmit} className="space-y-3">
        <FormField
            id="username"
            type="text"
            autoComplete="username"
            placeholder="your_username"
            label="Username"
            hint="3-64 characters, alphanumeric and . _ -"
            error={props.formState.errors.username?.message}
            {...props.register('username')}
        />

        <div className="grid grid-cols-2 gap-3">
            <FormField
                id="firstName"
                type="text"
                autoComplete="given-name"
                placeholder="Jane"
                label="First Name"
                error={props.formState.errors.firstName?.message}
                {...props.register('firstName')}
            />

            <FormField
                id="lastName"
                type="text"
                autoComplete="family-name"
                placeholder="Doe"
                label="Last Name"
                error={props.formState.errors.lastName?.message}
                {...props.register('lastName')}
            />
        </div>

        <FormField
            id="email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            label="Email"
            error={props.formState.errors.email?.message}
            {...props.register('email')}
        />

        <FormField
            id="dateOfBirth"
            type="date"
            label="Date of Birth"
            hint="Must be 19 years or older"
            error={props.formState.errors.dateOfBirth?.message}
            {...props.register('dateOfBirth')}
        />

        <FormField
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            label="Password"
            hint="8+ chars: uppercase, lowercase, digit, special character"
            error={props.formState.errors.password?.message}
            {...props.register('password')}
        />

        <FormField
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            label="Confirm Password"
            error={props.formState.errors.confirmPassword?.message}
            {...props.register('confirmPassword')}
        />

        <SubmitButton
            isSubmitting={props.submitting}
            idleText="Create Account"
            submittingText="Creating account..."
        />
    </form>
);

export default RegisterForm;
