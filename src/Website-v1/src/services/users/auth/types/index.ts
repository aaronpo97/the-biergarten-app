import { z } from 'zod';
import GetUserSchema from '../schema/GetUserSchema';
import { CreateUserValidationSchema } from '../schema/CreateUserValidationSchemas';

type User = z.infer<typeof GetUserSchema>;
type AuthUser = { username: string; hash: string; id: string };

export type CreateNewUser = (
  args: z.infer<typeof CreateUserValidationSchema>,
) => Promise<User>;

export type DeleteUserById = (args: { userId: string }) => Promise<AuthUser | null>;

export type FindUserById = (args: { userId: string }) => Promise<User | null>;

export type FindUserByUsername = (args: { username: string }) => Promise<AuthUser | null>;

export type FindUserByEmail = (args: { email: string }) => Promise<User | null>;

export type UpdateUserPassword = (args: {
  userId: string;
  password: string;
}) => Promise<AuthUser | null>;

export type SendConfirmationEmail = (args: {
  userId: string;
  username: string;
  email: string;
}) => Promise<void>;

export type SendResetPasswordEmail = (args: {
  userId: string;
  username: string;
  email: string;
}) => Promise<void>;

export type UpdateUserToBeConfirmedById = (args: { userId: string }) => Promise<User>;

export type UpdateUserById = (args: {
  userId: string;
  data: {
    email: string;
    firstName: string;
    lastName: string;
    username: string;
  };
}) => Promise<User>;
