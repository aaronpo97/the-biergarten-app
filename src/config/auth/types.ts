import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';
import { IncomingMessage } from 'http';
import { NextApiRequest } from 'next';
import { z } from 'zod';

export const BasicUserInfoSchema = z.object({
  id: z.string().cuid(),
  username: z.string(),
});

export const UserSessionSchema = BasicUserInfoSchema.merge(
  z.object({
    createdAt: z.number(),
    maxAge: z.number(),
  }),
);

export interface UserExtendedNextApiRequest extends NextApiRequest {
  user?: z.infer<typeof GetUserSchema>;
}

export type SessionRequest = IncomingMessage & {
  cookies: Partial<{
    [key: string]: string;
  }>;
};
