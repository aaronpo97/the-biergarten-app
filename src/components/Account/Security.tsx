import { Switch } from '@headlessui/react';
import { FunctionComponent, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UpdatePasswordSchema } from '@/services/User/schema/CreateUserValidationSchemas';
import sendUpdatePasswordRequest from '@/requests/User/sendUpdatePasswordRequest';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormTextInput from '../ui/forms/FormTextInput';

const Security: FunctionComponent = () => {
  const [editToggled, setEditToggled] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm<
    z.infer<typeof UpdatePasswordSchema>
  >({
    resolver: zodResolver(UpdatePasswordSchema),
  });

  const onSubmit: SubmitHandler<z.infer<typeof UpdatePasswordSchema>> = async (data) => {
    await sendUpdatePasswordRequest(data);
    setEditToggled((value) => !value);
    reset();
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
              checked={editToggled}
              onClick={() => {
                setEditToggled((val) => !val);
                reset();
              }}
            />
          </div>
        </div>
        {editToggled && (
          <form className="form-control" noValidate onSubmit={handleSubmit(onSubmit)}>
            <FormInfo>
              <FormLabel htmlFor="password">New Password</FormLabel>
              <FormError>{formState.errors.password?.message}</FormError>
            </FormInfo>
            <FormTextInput
              type="password"
              disabled={!editToggled || formState.isSubmitting}
              error={!!formState.errors.password}
              id="password"
              formValidationSchema={register('password')}
            />
            <FormInfo>
              <FormLabel htmlFor="password">Confirm Password</FormLabel>
              <FormError>{formState.errors.confirmPassword?.message}</FormError>
            </FormInfo>
            <FormTextInput
              type="password"
              disabled={!editToggled || formState.isSubmitting}
              error={!!formState.errors.confirmPassword}
              id="password"
              formValidationSchema={register('confirmPassword')}
            />

            <button
              className="btn-primary btn mt-5"
              disabled={!editToggled || formState.isSubmitting}
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
