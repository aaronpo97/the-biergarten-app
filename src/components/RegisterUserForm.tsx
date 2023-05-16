import sendRegisterUserRequest from '@/requests/sendRegisterUserRequest';
import { CreateUserValidationSchemaWithUsernameAndEmailCheck } from '@/services/User/schema/CreateUserValidationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { FC, useState } from 'react';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import ErrorAlert from './ui/alerts/ErrorAlert';
import Button from './ui/forms/Button';
import FormError from './ui/forms/FormError';
import FormInfo from './ui/forms/FormInfo';
import FormLabel from './ui/forms/FormLabel';
import FormSegment from './ui/forms/FormSegment';
import FormTextInput from './ui/forms/FormTextInput';

const RegisterUserForm: FC = () => {
  const router = useRouter();
  const { reset, register, handleSubmit, formState } = useForm<
    z.infer<typeof CreateUserValidationSchemaWithUsernameAndEmailCheck>
  >({ resolver: zodResolver(CreateUserValidationSchemaWithUsernameAndEmailCheck) });

  const { errors } = formState;
  const [serverResponseError, setServerResponseError] = useState('');

  const onSubmit = async (
    data: z.infer<typeof CreateUserValidationSchemaWithUsernameAndEmailCheck>,
  ) => {
    try {
      await sendRegisterUserRequest(data);
      reset();
      router.push('/', undefined, { shallow: true });
    } catch (error) {
      setServerResponseError(
        error instanceof Error
          ? error.message
          : 'Something went wrong. We could not register your account.',
      );
    }
  };
  return (
    <form
      className="form-control w-full space-y-5"
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div>
        {serverResponseError && (
          <ErrorAlert error={serverResponseError} setError={setServerResponseError} />
        )}
      </div>
      <div>
        <div className="flex flex-col lg:flex-row lg:space-x-3">
          <div className="lg:w-[50%]">
            <FormInfo>
              <FormLabel htmlFor="firstName">First name</FormLabel>
              <FormError>{errors.firstName?.message}</FormError>
            </FormInfo>
            <FormSegment>
              <FormTextInput
                disabled={formState.isSubmitting}
                id="firstName"
                type="text"
                formValidationSchema={register('firstName')}
                error={!!errors.firstName}
                placeholder="first name"
              />
            </FormSegment>
          </div>

          <div className="lg:w-[50%]">
            <FormInfo>
              <FormLabel htmlFor="lastName">Last name</FormLabel>
              <FormError>{errors.lastName?.message}</FormError>
            </FormInfo>
            <FormSegment>
              <FormTextInput
                disabled={formState.isSubmitting}
                id="lastName"
                type="text"
                formValidationSchema={register('lastName')}
                error={!!errors.lastName}
                placeholder="last name"
              />
            </FormSegment>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-3">
          <div className="lg:w-[50%]">
            <FormInfo>
              <FormLabel htmlFor="email">email</FormLabel>
              <FormError>{errors.email?.message}</FormError>
            </FormInfo>
            <FormSegment>
              <FormTextInput
                disabled={formState.isSubmitting}
                id="email"
                type="email"
                formValidationSchema={register('email')}
                error={!!errors.email}
                placeholder="email"
              />
            </FormSegment>
          </div>
          <div className="lg:w-[50%]">
            <FormInfo>
              <FormLabel htmlFor="username">username</FormLabel>
              <FormError>{errors.username?.message}</FormError>
            </FormInfo>
            <FormSegment>
              <FormTextInput
                disabled={formState.isSubmitting}
                id="username"
                type="text"
                formValidationSchema={register('username')}
                error={!!errors.username}
                placeholder="username"
              />
            </FormSegment>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-3">
          <div className="lg:w-[50%]">
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
          <div className="lg:w-[50%]">
            <FormInfo>
              <FormLabel htmlFor="confirmPassword">confirm password</FormLabel>
              <FormError>{errors.confirmPassword?.message}</FormError>
            </FormInfo>
            <FormSegment>
              <FormTextInput
                disabled={formState.isSubmitting}
                id="confirmPassword"
                type="password"
                formValidationSchema={register('confirmPassword')}
                error={!!errors.confirmPassword}
                placeholder="confirm password"
              />
            </FormSegment>
          </div>
        </div>
        <FormInfo>
          <FormLabel htmlFor="dateOfBirth">Date of birth</FormLabel>
          <FormError>{errors.dateOfBirth?.message}</FormError>
        </FormInfo>
        <FormSegment>
          <FormTextInput
            id="dateOfBirth"
            disabled={formState.isSubmitting}
            type="date"
            formValidationSchema={register('dateOfBirth')}
            error={!!errors.dateOfBirth}
            placeholder="date of birth"
          />
        </FormSegment>
        <div className="mt-6 w-full">
          <Button type="submit" isSubmitting={formState.isSubmitting}>
            Register User
          </Button>
        </div>
      </div>
    </form>
  );
};

export default RegisterUserForm;
