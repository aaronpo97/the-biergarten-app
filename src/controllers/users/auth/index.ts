import { removeTokenCookie } from '@/config/auth/cookie';
import localStrat from '@/config/auth/localStrat';
import { getLoginSession, setLoginSession } from '@/config/auth/session';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ServerError from '@/config/util/ServerError';

import { NextApiRequest, NextApiResponse } from 'next';
import { expressWrapper } from 'next-connect';
import passport from 'passport';
import { z } from 'zod';

import GetUserSchema from '@/services/users/auth/schema/GetUserSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import type { NextFunction } from 'express';
import { verifyConfirmationToken } from '@/config/jwt';

import { hashPassword } from '@/config/auth/passwordFns';

import {
  createNewUserService,
  deleteUserService,
  findUserByEmailService,
  findUserByUsernameService,
  sendConfirmationEmailService,
  sendResetPasswordEmailService,
  updateUserService,
  updateUserPasswordService,
  confirmUserService,
} from '@/services/users/auth';

import { EditUserRequest, UserRouteRequest } from '@/controllers/users/profile/types';
import {
  CheckEmailRequest,
  CheckUsernameRequest,
  RegisterUserRequest,
  ResetPasswordRequest,
  TokenValidationRequest,
  UpdatePasswordRequest,
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
  const [usernameTaken, emailTaken] = (
    await Promise.all([
      findUserByUsernameService({ username: req.body.username }),
      findUserByEmailService({ email: req.body.email }),
    ])
  ).map((user) => !!user);

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

  const user = await createNewUserService(req.body);

  await setLoginSession(res, {
    id: user.id,
    username: user.username,
  });

  await sendConfirmationEmailService({
    email: user.email,
    username: user.username,
    userId: user.id,
  });

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

  await confirmUserService({ userId: id });

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

  const user = await findUserByEmailService({ email });

  if (user) {
    await sendResetPasswordEmailService({
      email: user.email,
      username: user.username,
      userId: user.id,
    });
  }

  res.status(200).json({
    statusCode: 200,
    success: true,
    message:
      'If an account with that email exists, we have sent you an email to reset your password.',
  });
};

export const sendCurrentUser = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse,
) => {
  const { user } = req;
  res.status(200).json({
    message: `Currently logged in as ${user!.username}`,
    statusCode: 200,
    success: true,
    payload: user,
  });
};

export const checkEmail = async (req: CheckEmailRequest, res: NextApiResponse) => {
  const { email: emailToCheck } = req.query;

  const email = await findUserByEmailService({ email: emailToCheck });

  res.json({
    success: true,
    payload: { emailIsTaken: !!email },
    statusCode: 200,
    message: 'Getting email availability.',
  });
};

export const checkUsername = async (req: CheckUsernameRequest, res: NextApiResponse) => {
  const { username: usernameToCheck } = req.query;

  const username = await findUserByUsernameService({ username: usernameToCheck });

  res.json({
    success: true,
    payload: { usernameIsTaken: !!username },
    statusCode: 200,
    message: username ? 'Username is taken.' : 'Username is available.',
  });
};

export const updatePassword = async (
  req: UpdatePasswordRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const { password } = req.body;

  await updateUserPasswordService({
    userId: user.id,
    password: await hashPassword(password),
  });

  res.json({
    message: 'Updated user password.',
    statusCode: 200,
    success: true,
  });
};

export const resendConfirmation = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse,
) => {
  const user = req.user!;

  await sendConfirmationEmailService({
    userId: user.id,
    username: user.username,
    email: user.email,
  });
  res.status(200).json({
    message: `Resent the confirmation email for ${user.username}.`,
    statusCode: 200,
    success: true,
  });
};

export const editUserInfo = async (
  req: EditUserRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { email, firstName, lastName, username } = req.body;

  const updatedUser = await updateUserService({
    userId: req.user!.id,
    data: { email, firstName, lastName, username },
  });

  res.json({
    message: 'User edited successfully',
    payload: updatedUser,
    success: true,
    statusCode: 200,
  });
};

export const deleteAccount = async (
  req: UserRouteRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;
  const deletedUser = await deleteUserService({ userId: id });

  if (!deletedUser) {
    throw new ServerError('Could not find a user with that id.', 400);
  }

  res.send({
    message: 'Successfully deleted user.',
    statusCode: 200,
    success: true,
  });
};
