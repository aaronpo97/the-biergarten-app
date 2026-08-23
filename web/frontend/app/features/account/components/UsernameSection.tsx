import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'iconoir-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation, useSubmit } from 'react-router';
import FormField from '../../../components/ui/forms/FormField';
import SubmitButton from '../../../components/ui/forms/SubmitButton';
import { showErrorToast, showSuccessToast } from '../../../components/ui/toast/toast';
import { updateUsernameSchema, type UpdateUsernameSchema } from '../schemas';
import type { SectionProps } from '../types';
import SectionCard from './SectionCard';

const UsernameSection = ({
   username,
   open,
   onToggle,
   onSuccess,
   result,
}: SectionProps & { username: string }) => {
   const navigation = useNavigation();
   const submit = useSubmit();
   const isSubmitting = navigation.formData?.get('intent') === 'username';

   const usernameForm = useForm<UpdateUsernameSchema>({
      resolver: zodResolver(updateUsernameSchema),
      defaultValues: { newUsername: username },
   });

   useEffect(() => {
      if (!result || result.intent !== 'username') return;
      if (!result.success) {
         showErrorToast(result.error);
         return;
      }
      showSuccessToast('Username updated successfully.');
      onSuccess();
      usernameForm.reset({ newUsername: result.username });
   }, [result, onSuccess, usernameForm]);

   return (
      <SectionCard
         icon={<User className="size-5" aria-hidden="true" />}
         title="Username"
         description="Change the username you sign in with."
         open={open}
         onToggle={onToggle}
      >
         <form
            className="space-y-3"
            onSubmit={usernameForm.handleSubmit((values) =>
               submit({ ...values, intent: 'username' }, { method: 'post' }),
            )}
         >
            <FormField
               id="newUsername"
               type="text"
               placeholder={username}
               label="New Username"
               error={usernameForm.formState.errors.newUsername?.message}
               {...usernameForm.register('newUsername')}
            />
            <SubmitButton
               isSubmitting={isSubmitting}
               idleText="Update Username"
               submittingText="Updating..."
            />
         </form>
      </SectionCard>
   );
};

export default UsernameSection;
