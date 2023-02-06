import { IncomingMessage } from 'http';
import { NextApiRequest } from 'next';
import { z } from 'zod';

export const UserInfoSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
});

export const UserSessionSchema = UserInfoSchema.merge(
  z.object({
    createdAt: z.number(),
    maxAge: z.number(),
  }),
);

export interface ExtendedNextApiRequest extends NextApiRequest {
  user?: z.infer<typeof UserInfoSchema>;
}

export type SessionRequest = IncomingMessage & {
  cookies: Partial<{
    [key: string]: string;
  }>;
};
