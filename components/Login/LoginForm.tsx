import sendLoginUserRequest from '@/requests/sendLoginUserRequest';
import LoginValidationSchema from '@/services/user/schema/LoginValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import FormError from '../ui/forms/FormError';
import FormInfo from '../ui/forms/FormInfo';
import FormLabel from '../ui/forms/FormLabel';
import FormSegment from '../ui/forms/FormSegment';
import FormTextInput from '../ui/forms/FormTextInput';

type LoginT = z.infer<typeof LoginValidationSchema>;
const LoginForm = () => {
  const router = useRouter();
  const { register, handleSubmit, formState } = useForm<LoginT>({
    resolver: zodResolver(LoginValidationSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const { errors } = formState;

  const onSubmit: SubmitHandler<LoginT> = async (data) => {
    try {
      const response = await sendLoginUserRequest(data);

      router.push(`/users/${response.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form className="form-control w-9/12 space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
            id="password"
            type="password"
            formValidationSchema={register('password')}
            error={!!errors.password}
            placeholder="password"
          />
        </FormSegment>
      </div>

      <div className="w-full">
        <button type="submit" className="btn-primary btn w-full">
          Login
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
