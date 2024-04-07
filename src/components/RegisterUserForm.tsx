import { CreateUserValidationSchemaWithUsernameAndEmailCheck } from '@/services/users/auth/schema/CreateUserValidationSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/router';
import { FC } from 'react';

import { useForm } from 'react-hook-form';
import { z } from 'zod';

import createErrorToast from '@/util/createErrorToast';
import toast from 'react-hot-toast';
import { sendRegisterUserRequest } from '@/requests/users/auth';
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

  const onSubmit = async (
    data: z.infer<typeof CreateUserValidationSchemaWithUsernameAndEmailCheck>,
  ) => {
    try {
      const loadingToast = toast.loading('Registering user...');
      await sendRegisterUserRequest(data);
      reset();
      router.push('/', undefined, { shallow: true });

      toast.remove(loadingToast);

      toast.success('User registered!');
    } catch (error) {
      createErrorToast({
        toast,
        error,
      });
    }
  };
  return (
    <form className="form-control w-full" noValidate onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-5">
        <div className="flex flex-col lg:flex-row lg:space-x-5">
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
                placeholder="John"
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
                placeholder="Doe"
              />
            </FormSegment>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-5">
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
                placeholder="john.doe@example.com"
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
                placeholder="johndoe"
              />
            </FormSegment>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:space-x-5">
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
        <div>
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
        </div>
      </div>
      <div className="mt-10">
        <Button type="submit" isSubmitting={formState.isSubmitting}>
          Register User
        </Button>
      </div>
    </form>
  );
};

export default RegisterUserForm;
