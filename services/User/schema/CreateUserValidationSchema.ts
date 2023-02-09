import sub from 'date-fns/sub';
import { z } from 'zod';

const minimumDateOfBirth = sub(new Date(), { years: 19 });
const CreateUserValidationSchema = z.object({
  email: z.string().email({ message: 'Email must be a valid email address.' }),
  // use special characters, numbers, and uppercase letters
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

  firstName: z.string().min(1, { message: 'First name must not be empty.' }),
  lastName: z.string().min(1, { message: 'Last name must not be empty.' }),
  username: z
    .string()
    .min(1, { message: 'Username must not be empty.' })
    .max(20, { message: 'Username must be less than 20 characters.' }),
  dateOfBirth: z.string().refine(
    (dateOfBirth) => {
      const parsedDateOfBirth = new Date(dateOfBirth);

      return parsedDateOfBirth <= minimumDateOfBirth;
    },
    { message: 'You must be at least 19 years old to register.' },
  ),
});

export default CreateUserValidationSchema;
