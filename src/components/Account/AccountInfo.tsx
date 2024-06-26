import validateUsernameRequest from '@/requests/users/profile/validateUsernameRequest';
import { BaseCreateUserSchema } from '@/services/users/auth/schema/CreateUserValidationSchemas';
import { Switch } from '@headlessui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dispatch, FC, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import UserContext from '@/contexts/UserContext';

import createErrorToast from '@/util/createErrorToast';
import { toast } from 'react-hot-toast';
import { AccountPageAction, AccountPageState } from '@/reducers/accountPageReducer';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormTextInput from '../ui/forms/FormTextInput';
import { sendEditUserRequest, validateEmailRequest } from '@/requests/users/auth';

interface AccountInfoProps {
  pageState: AccountPageState;
  dispatch: Dispatch<AccountPageAction>;
}

const AccountInfo: FC<AccountInfoProps> = ({ pageState, dispatch }) => {
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
          return validateEmailRequest({ email });
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

  const onSubmit = async (data: z.infer<typeof EditUserSchema>) => {
    const loadingToast = toast.loading('Submitting edits...');
    try {
      await sendEditUserRequest({ user: user!, data });
      toast.remove(loadingToast);
      toast.success('Edits submitted successfully.');
      dispatch({ type: 'CLOSE_ALL' });
      await mutate!();
    } catch (error) {
      dispatch({ type: 'CLOSE_ALL' });
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
              checked={pageState.accountInfoOpen}
              onClick={async () => {
                dispatch({ type: 'TOGGLE_ACCOUNT_INFO_VISIBILITY' });
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
        {pageState.accountInfoOpen && (
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
                disabled={!pageState.accountInfoOpen || formState.isSubmitting}
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
                disabled={!pageState.accountInfoOpen || formState.isSubmitting}
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
                    disabled={!pageState.accountInfoOpen || formState.isSubmitting}
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
                    disabled={!pageState.accountInfoOpen || formState.isSubmitting}
                    error={!!formState.errors.lastName}
                    id="lastName"
                    formValidationSchema={register('lastName')}
                  />
                </div>
              </div>
              <button
                className="btn btn-primary my-5 w-full"
                type="submit"
                disabled={!pageState.accountInfoOpen || formState.isSubmitting}
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
