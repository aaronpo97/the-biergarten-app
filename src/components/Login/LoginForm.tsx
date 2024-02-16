import LoginValidationSchema from '@/services/users/auth/schema/LoginValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import UserContext from '@/contexts/UserContext';
import toast from 'react-hot-toast';

import createErrorToast from '@/util/createErrorToast';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextInput from '../ui/forms/FormTextInput';
import Button from '../ui/forms/Button';
import { sendLoginUserRequest } from '@/requests/users/auth';

type LoginT = z.infer<typeof LoginValidationSchema>;
const LoginForm = () => {
  const router = useRouter();
  const { register, handleSubmit, formState, reset } = useForm<LoginT>({
    resolver: zodResolver(LoginValidationSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { errors } = formState;

  const { mutate } = useContext(UserContext);

  const onSubmit: SubmitHandler<LoginT> = async (data) => {
    const loadingToast = toast.loading('Logging in...');
    try {
      await sendLoginUserRequest(data);
      await mutate!();
      toast.remove(loadingToast);
      toast.success('Logged in!');
      await router.push(`/users/current`);
    } catch (error) {
      toast.remove(loadingToast);
      createErrorToast(error);
      reset();
    }
  };

  return (
    <form className="form-control w-full space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <FormInfo>
          <FormLabel htmlFor="username">username</FormLabel>
          <FormError>{errors.username?.message}</FormError>
        </FormInfo>
        <FormSegment>
          <FormTextInput
            id="username"
            type="text"
            formValidationSchema={register('username')}
            disabled={formState.isSubmitting}
            error={!!errors.username}
            placeholder="username"
          />
        </FormSegment>

        <FormInfo>
          <FormLabel htmlFor="password">password</FormLabel>
          <FormError>{errors.password?.message}</FormError>
        </FormInfo>
        <FormSegment>
          <FormTextInput
            disabled={formState.isSubmitting}
            id="password"
            type="password"
            formValidationSchema={register('password')}
            error={!!errors.password}
            placeholder="password"
          />
        </FormSegment>
      </div>

      <div className="w-full">
        <Button type="submit" isSubmitting={formState.isSubmitting}>
          Login
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
