import { Button } from '@headlessui/react';
import { useState } from 'react';
import FormField from '../../../../../components/ui/forms/FormField';
import SubmitButton from '../../../../../components/ui/forms/SubmitButton';
import type { RegisterWizard } from '../../../hooks/useRegisterWizard';
import { minimumAgeYears } from '../../../schemas';
import ShowPasswordToggle from '../ShowPasswordToggle/ShowPasswordToggle';

interface RegisterFormProps {
    wizard: RegisterWizard;
    submitting: boolean;
}

const RegisterForm = ({ wizard, submitting }: RegisterFormProps) => {
    const [showPassword, setShowPassword] = useState(false);
    const { step, isLastStep, canGoBack, register, formState } = wizard;
    const { errors } = formState;

    return (
        <form onSubmit={wizard.onSubmit} className="flex flex-col gap-4" noValidate>
            {step === 1 && (
                <div className="flex flex-col gap-4">
                    <FormField
                        id="username"
                        type="text"
                        autoComplete="username"
                        label="Username"
                        hint="3-64 characters, alphanumeric and . _ -"
                        error={errors.username?.message}
                        {...register('username')}
                    />

                    <FormField
                        id="email"
                        type="email"
                        autoComplete="email"
                        label="Email"
                        error={errors.email?.message}
                        {...register('email')}
                    />
                </div>
            )}

            {step === 2 && (
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-3.5 min-[420px]:grid-cols-2">
                        <FormField
                            id="firstName"
                            type="text"
                            autoComplete="given-name"
                            label="First name"
                            error={errors.firstName?.message}
                            {...register('firstName')}
                        />

                        <FormField
                            id="lastName"
                            type="text"
                            autoComplete="family-name"
                            label="Last name"
                            error={errors.lastName?.message}
                            {...register('lastName')}
                        />
                    </div>

                    <FormField
                        id="dateOfBirth"
                        type="date"
                        label="Date of birth"
                        hint={`Must be ${minimumAgeYears} years or older.`}
                        error={errors.dateOfBirth?.message}
                        {...register('dateOfBirth')}
                    />
                </div>
            )}

            {step === 3 && (
                <div className="flex flex-col gap-4">
                    <FormField
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        label="Password"
                        hint="8+ chars: uppercase, lowercase, digit, special character"
                        error={errors.password?.message}
                        {...register('password')}
                    />

                    <FormField
                        id="confirmPassword"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        label="Confirm password"
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                    />

                    <ShowPasswordToggle
                        shown={showPassword}
                        onToggle={() => setShowPassword((shown) => !shown)}
                    />
                </div>
            )}

            <div className="flex gap-3">
                {canGoBack && (
                    <Button
                        type="button"
                        onClick={wizard.back}
                        className="btn btn-outline min-h-12"
                    >
                        Back
                    </Button>
                )}

                <div className="flex-1">
                    <SubmitButton
                        isSubmitting={submitting}
                        idleText={isLastStep ? 'Create account' : 'Continue'}
                        submittingText="Creating account…"
                        className="btn btn-primary min-h-12 w-full"
                    />
                </div>
            </div>
        </form>
    );
};

export default RegisterForm;
