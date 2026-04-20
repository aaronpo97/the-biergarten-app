import { validateEmailRequest } from '@/requests/users/auth';
import validateUsernameRequest from '@/requests/users/profile/validateUsernameRequest';
import sub from 'date-fns/sub';
import { z } from 'zod';

const MINIMUM_DATE_OF_BIRTH = sub(new Date(), { years: 19 });
const NAME_REGEX =
  /^[a-zA-ZàáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ðæ ,.'-]+$/u;

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
    .refine((firstName) => NAME_REGEX.test(firstName), {
      message: 'First name must only contain letters or hyphens.',
    }),
  lastName: z
    .string()
    .min(1, { message: 'Last name must not be empty.' })
    .max(20, { message: 'Last name must be less than 20 characters.' })
    .refine((lastName) => NAME_REGEX.test(lastName), {
      message: 'Last name must only contain letters.',
    }),
  dateOfBirth: z
    .string()
    .refine((val) => !Number.isNaN(Date.parse(val)), {
      message: 'Date is invalid.',
    })
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
      .refine(async (email) => validateEmailRequest({ email }), {
        message: 'Email is already taken.',
      }),
    username: z
      .string()
      .min(1, { message: 'Username must not be empty.' })
      .max(20, { message: 'Username must be less than 20 characters.' })
      .refine(async (username) => validateUsernameRequest(username), {
        message: 'Username is already taken.',
      }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const UpdatePasswordSchema = BaseCreateUserSchema.pick({
  password: true,
  confirmPassword: true,
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});
