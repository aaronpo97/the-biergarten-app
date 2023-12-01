import { Switch } from '@headlessui/react';
import { Dispatch, FunctionComponent } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UpdatePasswordSchema } from '@/services/User/schema/CreateUserValidationSchemas';
import sendUpdatePasswordRequest from '@/requests/User/sendUpdatePasswordRequest';
import { AccountPageState, AccountPageAction } from '@/reducers/accountPageReducer';
import toast from 'react-hot-toast';
import createErrorToast from '@/util/createErrorToast';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormTextInput from '../ui/forms/FormTextInput';

interface SecurityProps {
  pageState: AccountPageState;
  dispatch: Dispatch<AccountPageAction>;
}

const Security: FunctionComponent<SecurityProps> = ({ dispatch, pageState }) => {
  const { register, handleSubmit, formState, reset } = useForm<
    z.infer<typeof UpdatePasswordSchema>
  >({
    resolver: zodResolver(UpdatePasswordSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof UpdatePasswordSchema>> = async (data) => {
    const loadingToast = toast.loading('Changing password.');
    try {
      await sendUpdatePasswordRequest(data);
      toast.remove(loadingToast);
      toast.success('Password changed successfully.');
      dispatch({ type: 'CLOSE_ALL' });
    } catch (error) {
      dispatch({ type: 'CLOSE_ALL' });
      createErrorToast(error);
    }
  };

  return (
    <div className="card w-full space-y-4">
      <div className="card-body">
        <div className="flex w-full items-center justify-between space-x-5">
          <div className="">
            <h1 className="text-lg font-bold">Change Your Password</h1>
            <p>Update your password to maintain the safety of your account.</p>
          </div>
          <div>
            <Switch
              className="toggle"
              id="edit-toggle"
              checked={pageState.securityOpen}
              onClick={() => {
                dispatch({ type: 'TOGGLE_SECURITY_VISIBILITY' });
                reset();
              }}
            />
          </div>
        </div>
        {pageState.securityOpen && (
          <form className="form-control" noValidate onSubmit={handleSubmit(onSubmit)}>
            <FormInfo>
              <FormLabel htmlFor="password">New Password</FormLabel>
              <FormError>{formState.errors.password?.message}</FormError>
            </FormInfo>
            <FormTextInput
              type="password"
              disabled={!pageState.securityOpen || formState.isSubmitting}
              error={!!formState.errors.password}
              id="password"
              formValidationSchema={register('password')}
            />
            <FormInfo>
              <FormLabel htmlFor="confirm-password">Confirm Password</FormLabel>
              <FormError>{formState.errors.confirmPassword?.message}</FormError>
            </FormInfo>
            <FormTextInput
              type="password"
              disabled={!pageState.securityOpen || formState.isSubmitting}
              error={!!formState.errors.confirmPassword}
              id="confirm-password"
              formValidationSchema={register('confirmPassword')}
            />

            <button
              className="btn btn-primary mt-5"
              disabled={!pageState.securityOpen || formState.isSubmitting}
              type="submit"
            >
              Update
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Security;
