import { BasicUserInfoSchema } from '@/config/auth/types';
import {
  CreateUserValidationSchema,
  UpdatePasswordSchema,
} from '@/services/users/auth/schema/CreateUserValidationSchemas';
import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

export type SendEditUserRequest = (args: {
  user: z.infer<typeof GetUserSchema>;
  data: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type SendForgotPasswordRequest = (args: {
  email: string;
}) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type SendLoginUserRequest = (args: {
  username: string;
  password: string;
}) => Promise<z.infer<typeof BasicUserInfoSchema>>;

export type SendRegisterUserRequest = (
  args: z.infer<typeof CreateUserValidationSchema>,
) => Promise<z.infer<typeof GetUserSchema>>;

export type SendUpdatePasswordRequest = (
  args: z.infer<typeof UpdatePasswordSchema>,
) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type SendUserFollowRequest = (args: {
  userId: string;
}) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type ValidateEmailRequest = (args: { email: string }) => Promise<boolean>;
