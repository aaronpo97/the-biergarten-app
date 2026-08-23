import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'iconoir-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigation, useSubmit } from 'react-router';
import FormField from '../../../components/ui/forms/FormField';
import SubmitButton from '../../../components/ui/forms/SubmitButton';
import { showErrorToast, showSuccessToast } from '../../../components/ui/toast/toast';
import { updateProfileSchema, type UpdateProfileSchema } from '../schemas';
import type { SectionProps } from '../types';
import SectionCard from './SectionCard';

const ProfileSection = ({
   firstName,
   lastName,
   dateOfBirth,
   open,
   onToggle,
   onSuccess,
   result,
}: SectionProps & { firstName: string; lastName: string; dateOfBirth: string }) => {
   const navigation = useNavigation();
   const submit = useSubmit();
   const isSubmitting = navigation.formData?.get('intent') === 'profile';

   const profileForm = useForm<UpdateProfileSchema>({
      resolver: zodResolver(updateProfileSchema),
      defaultValues: { firstName, lastName, dateOfBirth },
   });

   useEffect(() => {
      if (!result || result.intent !== 'profile') return;
      if (!result.success) {
         showErrorToast(result.error);
         return;
      }
      showSuccessToast('Profile updated successfully.');
      onSuccess();
      profileForm.reset({
         firstName: result.firstName,
         lastName: result.lastName,
         dateOfBirth: result.dateOfBirth,
      });
   }, [result, onSuccess, profileForm]);

   return (
      <SectionCard
         icon={<User className="size-5" aria-hidden="true" />}
         title="Profile"
         description="Update your name and date of birth."
         open={open}
         onToggle={onToggle}
      >
         <form
            className="space-y-3"
            onSubmit={profileForm.handleSubmit((values) =>
               submit({ ...values, intent: 'profile' }, { method: 'post' }),
            )}
         >
            <div className="grid grid-cols-2 gap-3">
               <FormField
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="Jane"
                  label="First Name"
                  error={profileForm.formState.errors.firstName?.message}
                  {...profileForm.register('firstName')}
               />
               <FormField
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  label="Last Name"
                  error={profileForm.formState.errors.lastName?.message}
                  {...profileForm.register('lastName')}
               />
            </div>
            <FormField
               id="dateOfBirth"
               type="date"
               label="Date of Birth"
               error={profileForm.formState.errors.dateOfBirth?.message}
               {...profileForm.register('dateOfBirth')}
            />
            <SubmitButton
               isSubmitting={isSubmitting}
               idleText="Update Profile"
               submittingText="Updating..."
            />
         </form>
      </SectionCard>
   );
};

export default ProfileSection;
