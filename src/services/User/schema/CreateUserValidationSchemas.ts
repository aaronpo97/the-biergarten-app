import validateEmail from '@/requests/valdiateEmail';
import validateUsername from '@/requests/validateUsername';
import sub from 'date-fns/sub';
import { z } from 'zod';

const MINIMUM_DATE_OF_BIRTH = sub(new Date(), { years: 19 });

export const BaseCreateUserSchema = z.object({
  password: z
    .string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .refine((password) => /[A-Z]/.test(password), {
      message: 'Password must contain at least one uppercase letter.',
    })
    .refine((password) => /[0-9]/.test(password), {
      message: 'Password must contain at least one number.',
    })
    .refine((password) => /[^a-zA-Z0-9]/.test(password), {
      message: 'Password must contain at least one special character.',
    }),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(1, { message: 'First name must not be empty.' })
    .max(20, { message: 'First name must be less than 20 characters.' })
    .refine((firstName) => /^[a-zA-Z]+$/.test(firstName), {
      message: 'First name must only contain letters.',
    }),
  lastName: z
    .string()
    .min(1, { message: 'Last name must not be empty.' })
    .max(20, { message: 'Last name must be less than 20 characters.' })
    .refine((lastName) => /^[a-zA-Z]+$/.test(lastName), {
      message: 'Last name must only contain letters.',
    }),
  dateOfBirth: z
    .string()
    .refine((dateOfBirth) => new Date(dateOfBirth) <= MINIMUM_DATE_OF_BIRTH, {
      message: 'You must be at least 19 years old to register.',
    }),
  username: z
    .string()
    .min(1, { message: 'Username must not be empty.' })
    .max(20, { message: 'Username must be less than 20 characters.' }),
  email: z.string().email({ message: 'Email must be a valid email address.' }),
});

export const CreateUserValidationSchema = BaseCreateUserSchema.refine(
  (data) => data.password === data.confirmPassword,
  { message: 'Passwords do not match.', path: ['confirmPassword'] },
);

export const CreateUserValidationSchemaWithUsernameAndEmailCheck =
  BaseCreateUserSchema.extend({
    email: z
      .string()
      .email({ message: 'Email must be a valid email address.' })
      .refine(async (email) => validateEmail(email), {
        message: 'Email is already taken.',
      }),
    username: z
      .string()
      .min(1, { message: 'Username must not be empty.' })
      .max(20, { message: 'Username must be less than 20 characters.' })
      .refine(async (username) => validateUsername(username), {
        message: 'Username is already taken.',
      }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });
