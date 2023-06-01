import validateEmailRequest from '@/requests/User/validateEmailRequest';
import validateUsernameRequest from '@/requests/validateUsernameRequest';
import { BaseCreateUserSchema } from '@/services/User/schema/CreateUserValidationSchemas';
import { Switch } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FC, useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import UserContext from '@/contexts/UserContext';
import sendEditUserRequest from '@/requests/User/sendEditUserRequest';
import createErrorToast from '@/util/createErrorToast';
import { toast } from 'react-hot-toast';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormTextInput from '../ui/forms/FormTextInput';

const AccountInfo: FC = () => {
  const { user, mutate } = useContext(UserContext);

  const EditUserSchema = BaseCreateUserSchema.pick({
    username: true,
    email: true,
    firstName: true,
    lastName: true,
  }).extend({
    email: z
      .string()
      .email({ message: 'Email must be a valid email address.' })
      .refine(
        async (email) => {
          if (user!.email === email) return true;
          return validateEmailRequest(email);
        },
        { message: 'Email is already taken.' },
      ),
    username: z
      .string()
      .min(1, { message: 'Username must not be empty.' })
      .max(20, { message: 'Username must be less than 20 characters.' })
      .refine(
        async (username) => {
          if (user!.username === username) return true;
          return validateUsernameRequest(username);
        },
        { message: 'Username is already taken.' },
      ),
  });

  const [editToggled, setEditToggled] = useState(false);

  const onSubmit = async (data: z.infer<typeof EditUserSchema>) => {
    const loadingToast = toast.loading('Submitting edits...');
    try {
      await sendEditUserRequest({ user: user!, data });
      toast.remove(loadingToast);
      toast.success('Edits submitted successfully.');
      setEditToggled(false);
      await mutate!();
    } catch (error) {
      setEditToggled(false);
      toast.remove(loadingToast);
      createErrorToast(error);
      await mutate!();
    }
  };
  const { register, handleSubmit, formState, reset } = useForm<
    z.infer<typeof EditUserSchema>
  >({
    resolver: zodResolver(EditUserSchema),
  });

  return (
    <div className="card mt-8">
      <div className="card-body flex flex-col space-y-3">
        <div className="flex w-full items-center justify-between space-x-5">
          <div className="">
            <h1 className="text-lg font-bold">Edit Your Account Info</h1>
            <p>Update your personal account information.</p>
          </div>
          <div>
            <Switch
              className="toggle"
              id="edit-toggle"
              checked={editToggled}
              onClick={async () => {
                setEditToggled((val) => !val);
                await mutate!();
                reset({
                  username: user!.username,
                  email: user!.email,
                  firstName: user!.firstName,
                  lastName: user!.lastName,
                });
              }}
            />
          </div>
        </div>
        {editToggled && (
          <form
            className="form-control space-y-5"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <div>
              <FormInfo>
                <FormLabel htmlFor="username">Username</FormLabel>
                <FormError>{formState.errors.username?.message}</FormError>
              </FormInfo>
              <FormTextInput
                type="text"
                disabled={!editToggled || formState.isSubmitting}
                error={!!formState.errors.username}
                id="username"
                formValidationSchema={register('username')}
              />
              <FormInfo>
                <FormLabel htmlFor="email">Email</FormLabel>
                <FormError>{formState.errors.email?.message}</FormError>
              </FormInfo>
              <FormTextInput
                type="email"
                disabled={!editToggled || formState.isSubmitting}
                error={!!formState.errors.email}
                id="email"
                formValidationSchema={register('email')}
              />

              <div className="flex space-x-3">
                <div className="w-1/2">
                  <FormInfo>
                    <FormLabel htmlFor="firstName">First Name</FormLabel>
                    <FormError>{formState.errors.firstName?.message}</FormError>
                  </FormInfo>
                  <FormTextInput
                    type="text"
                    disabled={!editToggled || formState.isSubmitting}
                    error={!!formState.errors.firstName}
                    id="firstName"
                    formValidationSchema={register('firstName')}
                  />
                </div>
                <div className="w-1/2">
                  <FormInfo>
                    <FormLabel htmlFor="lastName">Last Name</FormLabel>
                    <FormError>{formState.errors.lastName?.message}</FormError>
                  </FormInfo>
                  <FormTextInput
                    type="text"
                    disabled={!editToggled || formState.isSubmitting}
                    error={!!formState.errors.lastName}
                    id="lastName"
                    formValidationSchema={register('lastName')}
                  />
                </div>
              </div>
              <button
                className="btn-primary btn my-5 w-full"
                type="submit"
                disabled={!editToggled || formState.isSubmitting}
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AccountInfo;
