import ErrorAlert from '@/components/ui/alerts/ErrorAlert';
import Button from '@/components/ui/forms/Button';
import FormError from '@/components/ui/forms/FormError';
import FormInfo from '@/components/ui/forms/FormInfo';
import FormLabel from '@/components/ui/forms/FormLabel';
import FormSegment from '@/components/ui/forms/FormSegment';
import FormTextInput from '@/components/ui/forms/FormTextInput';
import Layout from '@/components/ui/Layout';
import sendRegisterUserRequest from '@/requests/sendRegisterUserRequest';
import CreateUserValidationSchema from '@/services/User/schema/CreateUserValidationSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import { NextPage } from 'next';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaUserCircle } from 'react-icons/fa';
import { z } from 'zod';

interface RegisterUserProps {}

const RegisterUserPage: NextPage<RegisterUserProps> = () => {
  const { reset, register, handleSubmit, formState } = useForm<
    z.infer<typeof CreateUserValidationSchema>
  >({
    resolver: zodResolver(CreateUserValidationSchema),
  });

  const { errors } = formState;

  const [serverResponseError, setServerResponseError] = useState('');

  const onSubmit = async (data: z.infer<typeof CreateUserValidationSchema>) => {
    try {
      await sendRegisterUserRequest(data);
      reset();
    } catch (error) {
      setServerResponseError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. We could not register your account.',
      );
    }
  };

  return (
    <Layout>
      <div
        className="flex h-full flex-col items-center justify-center space-y-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center space-y-2">
          <FaUserCircle className="text-3xl" />
          <h1 className="text-4xl font-bold">Register</h1>
        </div>
        <form className="form-control w-7/12 space-y-5" noValidate>
          {serverResponseError && (
            <ErrorAlert error={serverResponseError} setError={setServerResponseError} />
          )}
          <div>
            <div className="flex flex-row space-x-3">
              <div className="w-[50%]">
                <FormInfo>
                  <FormLabel htmlFor="firstName">First name</FormLabel>
                  <FormError>{errors.firstName?.message}</FormError>
                </FormInfo>
                <FormSegment>
                  <FormTextInput
                    id="firstName"
                    type="text"
                    formValidationSchema={register('firstName')}
                    error={!!errors.firstName}
                    placeholder="first name"
                  />
                </FormSegment>
              </div>

              <div className="w-[50%]">
                <FormInfo>
                  <FormLabel htmlFor="lastName">Last name</FormLabel>
                  <FormError>{errors.lastName?.message}</FormError>
                </FormInfo>
                <FormSegment>
                  <FormTextInput
                    id="lastName"
                    type="text"
                    formValidationSchema={register('lastName')}
                    error={!!errors.lastName}
                    placeholder="last name"
                  />
                </FormSegment>
              </div>
            </div>
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
              <FormLabel htmlFor="email">email</FormLabel>
              <FormError>{errors.email?.message}</FormError>
            </FormInfo>
            <FormSegment>
              <FormTextInput
                id="email"
                type="email"
                formValidationSchema={register('email')}
                error={!!errors.email}
                placeholder="email"
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
            <FormInfo>
              <FormLabel htmlFor="confirmPassword">confirm password</FormLabel>
              <FormError>{errors.confirmPassword?.message}</FormError>
            </FormInfo>
            <FormSegment>
              <FormTextInput
                id="confirmPassword"
                type="password"
                formValidationSchema={register('confirmPassword')}
                error={!!errors.confirmPassword}
                placeholder="confirm password"
              />
            </FormSegment>
            <FormInfo>
              <FormLabel htmlFor="dateOfBirth">Date of birth</FormLabel>
              <FormError>{errors.dateOfBirth?.message}</FormError>
            </FormInfo>
            <FormSegment>
              <FormTextInput
                id="dateOfBirth"
                type="date"
                formValidationSchema={register('dateOfBirth')}
                error={!!errors.dateOfBirth}
                placeholder="date of birth"
              />
            </FormSegment>
            <Button type="submit">Register User</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default RegisterUserPage;
