import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'iconoir-react';
import { useForm } from 'react-hook-form';
import { useNavigation, useSubmit } from 'react-router';
import FormField from '../../../components/ui/forms/FormField';
import SubmitButton from '../../../components/ui/forms/SubmitButton';
import { showSuccessToast } from '../../../components/ui/toast/toast';
import { useSectionResult } from '../hooks/useSectionResult';
import { updateEmailSchema, type UpdateEmailSchema } from '../schemas';
import type { SectionProps } from '../types';
import SectionCard from './SectionCard';

const EmailSection = ({
    email,
    open,
    onToggle,
    onSuccess,
    result,
}: SectionProps & { email: string }) => {
    const navigation = useNavigation();
    const submit = useSubmit();
    const isSubmitting = navigation.formData?.get('intent') === 'email';

    const emailForm = useForm<UpdateEmailSchema>({
        resolver: zodResolver(updateEmailSchema),
        defaultValues: { newEmail: email },
    });

    useSectionResult(result, 'email', (emailResult) => {
        showSuccessToast(
            emailResult.emailConfirmed
                ? 'Email updated successfully.'
                : 'Email updated. Please re-confirm your new address.',
        );
        onSuccess();
        emailForm.reset({ newEmail: emailResult.email });
    });

    return (
        <SectionCard
            icon={<Mail className="size-5" aria-hidden="true" />}
            title="Email Address"
            description="Change your email. You'll need to re-confirm the new address."
            open={open}
            onToggle={onToggle}
        >
            <form
                className="space-y-3"
                onSubmit={emailForm.handleSubmit((values) =>
                    submit({ ...values, intent: 'email' }, { method: 'post' }),
                )}
            >
                <FormField
                    id="newEmail"
                    type="email"
                    autoComplete="email"
                    placeholder="jane@example.com"
                    label="New Email"
                    error={emailForm.formState.errors.newEmail?.message}
                    {...emailForm.register('newEmail')}
                />
                <SubmitButton
                    isSubmitting={isSubmitting}
                    idleText="Update Email"
                    submittingText="Updating..."
                />
            </form>
        </SectionCard>
    );
};

export default EmailSection;
