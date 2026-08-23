import { zodResolver } from '@hookform/resolvers/zod';
import { Lock } from 'iconoir-react';
import { useForm } from 'react-hook-form';
import { useNavigation, useSubmit } from 'react-router';
import FormField from '../../../components/ui/forms/FormField';
import SubmitButton from '../../../components/ui/forms/SubmitButton';
import { useSectionError } from '../hooks/useSectionError';
import { updatePasswordSchema, type UpdatePasswordSchema } from '../schemas';
import type { SectionProps } from '../types';
import SectionCard from './SectionCard';

const PasswordSection = ({ open, onToggle, result }: SectionProps) => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const isSubmitting = navigation.formData?.get('intent') === 'password';

    const passwordForm = useForm<UpdatePasswordSchema>({
        resolver: zodResolver(updatePasswordSchema),
    });

    useSectionError(result, 'password');

    return (
        <SectionCard
            icon={<Lock className="size-5" aria-hidden="true" />}
            title="Password"
            description="Change the password used to sign in."
            open={open}
            onToggle={onToggle}
        >
            <form
                className="space-y-3"
                onSubmit={passwordForm.handleSubmit((values) =>
                    submit({ ...values, intent: 'password' }, { method: 'post' }),
                )}
            >
                <FormField
                    id="currentPassword"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••••"
                    label="Current Password"
                    error={passwordForm.formState.errors.currentPassword?.message}
                    {...passwordForm.register('currentPassword')}
                />
                <FormField
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    label="New Password"
                    hint="8+ chars: uppercase, lowercase, digit, special character"
                    error={passwordForm.formState.errors.newPassword?.message}
                    {...passwordForm.register('newPassword')}
                />
                <FormField
                    id="confirmNewPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    label="Confirm New Password"
                    error={passwordForm.formState.errors.confirmNewPassword?.message}
                    {...passwordForm.register('confirmNewPassword')}
                />
                <SubmitButton
                    isSubmitting={isSubmitting}
                    idleText="Change Password"
                    submittingText="Changing..."
                />
            </form>
        </SectionCard>
    );
};

export default PasswordSection;
