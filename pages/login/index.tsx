import { NextPage } from 'next';
import { SubmitHandler, useForm } from 'react-hook-form';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormError from '@/components/ui/forms/FormError';
import FormInfo from '@/components/ui/forms/FormInfo';
import FormLabel from '@/components/ui/forms/FormLabel';
import FormSegment from '@/components/ui/forms/FormSegment';
import FormTextInput from '@/components/ui/forms/FormTextInput';
import Layout from '@/components/ui/Layout';
import LoginValidationSchema from '@/services/user/schema/LoginValidationSchema';
import sendLoginUserRequest from '@/requests/sendLoginUserRequest';
import useUser from '@/hooks/useUser';

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

const LoginPage: NextPage = () => {
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      return;
    }

    router.push(`/user/current`);
  }, [user]);

  return (
    <Layout>
      <div className="flex h-full flex-row">
        <div className="flex h-full w-[40%] flex-col items-center justify-center bg-base-100">
          <h1>Login</h1>
        </div>
        <div className="flex h-full w-[60%] flex-col items-center justify-center bg-base-300">
          <LoginForm />
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage;
