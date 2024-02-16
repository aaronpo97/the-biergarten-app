import Button from '@/components/ui/forms/Button';
import FormError from '@/components/ui/forms/FormError';
import FormInfo from '@/components/ui/forms/FormInfo';
import FormLabel from '@/components/ui/forms/FormLabel';
import FormSegment from '@/components/ui/forms/FormSegment';
import FormTextInput from '@/components/ui/forms/FormTextInput';
import { BaseCreateUserSchema } from '@/services/users/auth/schema/CreateUserValidationSchemas';
import createErrorToast from '@/util/createErrorToast';
import { zodResolver } from '@hookform/resolvers/zod';
import { NextPage } from 'next';

import { SubmitHandler, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';

import { FaUserCircle } from 'react-icons/fa';
import { sendForgotPasswordRequest } from '@/requests/users/auth';

interface ForgotPasswordPageProps {}

const ForgotPasswordPage: NextPage<ForgotPasswordPageProps> = () => {
  const { register, handleSubmit, formState, reset } = useForm({
    resolver: zodResolver(BaseCreateUserSchema.pick({ email: true })),
    defaultValues: { email: '' },
  });

  const router = useRouter();
  const { errors } = formState;

  const onSubmit: SubmitHandler<{ email: string }> = async (data) => {
    try {
      const loadingToast = toast.loading('Sending reset link...');
      await sendForgotPasswordRequest({ email: data.email });
      reset();
      toast.dismiss(loadingToast);
      toast.success('Password reset link sent!');

      router.push('/');
    } catch (error) {
      createErrorToast(error);
    }
  };

  return (
    <div className="flex h-full flex-col items-center">
      <div className="mt-64 flex w-10/12 flex-col space-y-3 text-center xl:w-6/12">
        <div className="space-y-1">
          <div className="my-2 flex flex-col items-center justify-center">
            <FaUserCircle className="text-3xl" />
            <h1 className="text-3xl font-bold">Forgot Your Password?</h1>
          </div>
          <p className="xl:text-lg">
            Enter your email address below, and we will send you a link to reset your
            password.
          </p>
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="form-control space-y-3"
          noValidate
        >
          <div>
            <FormInfo>
              <FormLabel htmlFor="email">Email</FormLabel>
              <FormError>{errors.email?.message}</FormError>
            </FormInfo>
            <FormSegment>
              <FormTextInput
                id="email"
                type="email"
                formValidationSchema={register('email')}
                disabled={formState.isSubmitting}
                error={!!errors.email}
                placeholder="Email"
              />
            </FormSegment>
          </div>
          <div>
            <Button type="submit" isSubmitting={formState.isSubmitting}>
              Send Reset Link
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
