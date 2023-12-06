import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { CreateUserValidationSchema } from '@/services/User/schema/CreateUserValidationSchemas';
import TokenValidationSchema from '@/services/User/schema/TokenValidationSchema';
import { NextApiRequest } from 'next';
import { z } from 'zod';

export interface RegisterUserRequest extends NextApiRequest {
  body: z.infer<typeof CreateUserValidationSchema>;
}

export interface TokenValidationRequest extends UserExtendedNextApiRequest {
  query: z.infer<typeof TokenValidationSchema>;
}

export interface ResetPasswordRequest extends NextApiRequest {
  body: { email: string };
}
