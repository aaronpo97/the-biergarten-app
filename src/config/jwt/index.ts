import { BasicUserInfoSchema } from '@/config/auth/types';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { z } from 'zod';
import { CONFIRMATION_TOKEN_SECRET, RESET_PASSWORD_TOKEN_SECRET } from '../env';
import ServerError from '../util/ServerError';

export const generateConfirmationToken = (user: z.infer<typeof BasicUserInfoSchema>) => {
  return jwt.sign(user, CONFIRMATION_TOKEN_SECRET, { expiresIn: '3m' });
};

export const verifyConfirmationToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, CONFIRMATION_TOKEN_SECRET);

    const parsed = BasicUserInfoSchema.safeParse(decoded);

    if (!parsed.success) {
      throw new Error('Invalid token');
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof Error && error.message === 'jwt expired') {
      throw new ServerError(
        'Your confirmation token is expired. Please generate a new one.',
        401,
      );
    }

    throw new ServerError('Something went wrong', 500);
  }
};

export const generateResetPasswordToken = (user: z.infer<typeof BasicUserInfoSchema>) => {
  return jwt.sign(user, RESET_PASSWORD_TOKEN_SECRET, { expiresIn: '5m' });
};
export const verifyResetPasswordToken = async (token: string) => {
  try {
    const decoded = jwt.verify(token, RESET_PASSWORD_TOKEN_SECRET);

    const parsed = BasicUserInfoSchema.safeParse(decoded);

    if (!parsed.success) {
      throw new Error('Invalid token');
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      throw new ServerError(
        'Your reset password token is invalid. Please generate a new one.',
        401,
      );
    }

    throw new ServerError('Something went wrong', 500);
  }
};
