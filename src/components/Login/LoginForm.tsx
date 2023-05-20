import sendLoginUserRequest from '@/requests/sendLoginUserRequest';
import LoginValidationSchema from '@/services/User/schema/LoginValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useContext, useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import UserContext from '@/contexts/UserContext';
import ToastContext from '@/contexts/ToastContext';
import ErrorAlert from '../ui/alerts/ErrorAlert';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextInput from '../ui/forms/FormTextInput';
import Button from '../ui/forms/Button';

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

  const [responseError, setResponseError] = useState<string>('');

  const { mutate } = useContext(UserContext);
  const { toast } = useContext(ToastContext);

  const onSubmit: SubmitHandler<LoginT> = async (data) => {
    try {
      const id = toast.loading('Logging in.');
      await sendLoginUserRequest(data);
      await mutate!();
      await router.push(`/user/current`);
      toast.remove(id);
    } catch (error) {
      if (error instanceof Error) {
        setResponseError(error.message);
        reset();
      }
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

      {responseError && <ErrorAlert error={responseError} setError={setResponseError} />}
      <div className="w-full">
        <Button type="submit" isSubmitting={formState.isSubmitting}>
          Login
        </Button>
      </div>
    </form>
  );
};

export default LoginForm;
