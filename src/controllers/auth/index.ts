import { removeTokenCookie } from '@/config/auth/cookie';
import localStrat from '@/config/auth/localStrat';
import { getLoginSession, setLoginSession } from '@/config/auth/session';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ServerError from '@/config/util/ServerError';
import createNewUser from '@/services/User/createNewUser';
import findUserByEmail from '@/services/User/findUserByEmail';
import { NextApiRequest, NextApiResponse } from 'next';
import { expressWrapper } from 'next-connect';
import passport from 'passport';
import { z } from 'zod';

import findUserByUsername from '@/services/User/findUserByUsername';
import GetUserSchema from '@/services/User/schema/GetUserSchema';
import sendConfirmationEmail from '@/services/User/sendConfirmationEmail';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import type { NextFunction } from 'express';
import { verifyConfirmationToken } from '@/config/jwt';
import updateUserToBeConfirmedById from '@/services/User/updateUserToBeConfirmedById';
import DBClient from '@/prisma/DBClient';
import sendResetPasswordEmail from '@/services/User/sendResetPasswordEmail';
import {
  RegisterUserRequest,
  ResetPasswordRequest,
  TokenValidationRequest,
} from './types';

export const authenticateUser = expressWrapper(
  async (
    req: UserExtendedNextApiRequest,
    res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
    next: NextFunction,
  ) => {
    passport.initialize();
    passport.use(localStrat);
    passport.authenticate(
      'local',
      { session: false },
      (error: unknown, token: z.infer<typeof GetUserSchema>) => {
        if (error) {
          next(error);
          return;
        }
        req.user = token;
        next();
      },
    )(req, res, next);
  },
);

export const loginUser = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  await setLoginSession(res, user);

  res.status(200).json({
    message: 'Login successful.',
    payload: user,
    statusCode: 200,
    success: true,
  });
};

export const logoutUser = async (
  req: NextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const session = await getLoginSession(req);

  if (!session) {
    throw new ServerError('You are not logged in.', 400);
  }

  removeTokenCookie(res);

  res.redirect('/');
};

export const registerUser = async (
  req: RegisterUserRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const [usernameTaken, emailTaken] = await Promise.all([
    findUserByUsername(req.body.username),
    findUserByEmail(req.body.email),
  ]);

  if (usernameTaken) {
    throw new ServerError(
      'Could not register a user with that username as it is already taken.',
      409,
    );
  }

  if (emailTaken) {
    throw new ServerError(
      'Could not register a user with that email as it is already taken.',
      409,
    );
  }

  const user = await createNewUser(req.body);

  await setLoginSession(res, {
    id: user.id,
    username: user.username,
  });

  await sendConfirmationEmail(user);

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'User registered successfully.',
    payload: user,
  });
};

export const confirmUser = async (
  req: TokenValidationRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { token } = req.query;

  const user = req.user!;
  const { id } = await verifyConfirmationToken(token);

  if (user.accountIsVerified) {
    throw new ServerError('Your account is already verified.', 400);
  }

  if (user.id !== id) {
    throw new ServerError('Could not confirm user.', 401);
  }

  await updateUserToBeConfirmedById(id);

  res.status(200).json({
    message: 'User confirmed successfully.',
    statusCode: 200,
    success: true,
  });
};

export const resetPassword = async (
  req: ResetPasswordRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { email } = req.body;

  const user = await DBClient.instance.user.findUnique({
    where: { email },
  });

  if (user) {
    await sendResetPasswordEmail(user);
  }

  res.status(200).json({
    statusCode: 200,
    success: true,
    message:
      'If an account with that email exists, we have sent you an email to reset your password.',
  });
};
