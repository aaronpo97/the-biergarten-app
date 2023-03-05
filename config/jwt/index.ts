import { BasicUserInfoSchema } from '@/config/auth/types';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const { CONFIRMATION_TOKEN_SECRET } = process.env;

if (!CONFIRMATION_TOKEN_SECRET) {
  throw new Error('CONFIRMATION_TOKEN_SECRET is not defined');
}

type User = z.infer<typeof BasicUserInfoSchema>;

export const generateConfirmationToken = (user: User) => {
  const token = jwt.sign(user, CONFIRMATION_TOKEN_SECRET, { expiresIn: '30m' });
  return token;
};

export const verifyConfirmationToken = (token: string) => {
  const decoded = jwt.verify(token, CONFIRMATION_TOKEN_SECRET);

  const parsed = BasicUserInfoSchema.safeParse(decoded);

  if (!parsed.success) {
    throw new Error('Invalid token');
  }

  return parsed.data;
};
