import { z } from 'zod';

const LoginValidationSchema = z.object({
  username: z
    .string({
      required_error: 'Username is required.',
      invalid_type_error: 'Username must be a string.',
    })
    .min(1, { message: 'Username is required.' }),
  password: z
    .string({
      required_error: 'Password is required.',
      invalid_type_error: 'Password must be a string.',
    })
    .min(1, { message: 'Password is required.' }),
});

export default LoginValidationSchema;
