/* eslint-disable import/prefer-default-export */
import { hashPassword } from '@/config/auth/passwordFns';
import DBClient from '@/prisma/DBClient';
import { BASE_URL } from '@/config/env';
import { generateConfirmationToken, generateResetPasswordToken } from '@/config/jwt';
import sendEmail from '@/config/sparkpost/sendEmail';

import { ReactElement } from 'react';
import ServerError from '@/config/util/ServerError';
import { render } from '@react-email/render';
import WelcomeEmail from '@/emails/WelcomeEmail';
import ResetPasswordEmail from '@/emails/ForgotEmail';

import {
  CreateNewUser,
  DeleteUserById,
  FindUserByEmail,
  FindUserByUsername,
  FindUserById,
  SendConfirmationEmail,
  SendResetPasswordEmail,
  UpdateUserToBeConfirmedById,
  UpdateUserPassword,
  UpdateUserById,
} from './types';

/**
 * The select object for retrieving users.
 *
 * Satisfies the GetUserSchema zod schema.
 *
 * @example
 *   const users = await DBClient.instance.user.findMany({
 *     select: userSelect,
 *   });
 */
const userSelect = {
  id: true,
  username: true,
  email: true,
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  createdAt: true,
  accountIsVerified: true,
  updatedAt: true,
  role: true,
  userAvatar: true,
  bio: true,
} as const;

/**
 * The select object for retrieving users without sensitive information.
 *
 * @example
 *   const user = await DBClient.instance.user.findUnique({
 *     where: { id: userId },
 *     select: AuthUserSelect,
 *   });
 */
const authUserSelect = {
  id: true,
  username: true,
  hash: true,
} as const;

/**
 * Creates a new user.
 *
 * @param args The arguments for service.
 * @param args.email The email of the user to create.
 * @param args.password The password of the user to create.
 * @param args.firstName The first name of the user to create.
 * @param args.lastName The last name of the user to create.
 * @param args.dateOfBirth The date of birth of the user to create.
 * @param args.username The username of the user to create.
 * @returns The user.
 */
export const createNewUser: CreateNewUser = async ({
  email,
  password,
  firstName,
  lastName,
  dateOfBirth,
  username,
}) => {
  const hash = await hashPassword(password);

  const user = await DBClient.instance.user.create({
    data: {
      username,
      email,
      hash,
      firstName,
      lastName,
      dateOfBirth: new Date(dateOfBirth),
    },
    select: userSelect,
  });

  return user;
};

/**
 * Deletes a user by id.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to delete.
 * @returns The user that was deleted if found, otherwise null.
 */
export const deleteUserById: DeleteUserById = ({ userId }) => {
  return DBClient.instance.user.delete({ where: { id: userId }, select: authUserSelect });
};

/**
 * Finds a user by username.
 *
 * @param args The arguments for service.
 * @param args.username The username of the user to find.
 * @returns The user if found, otherwise null.
 */

export const findUserByUsername: FindUserByUsername = async ({ username }) => {
  return DBClient.instance.user.findUnique({
    where: { username },
    select: authUserSelect,
  });
};

/**
 * Finds a user by email.
 *
 * @param args The arguments for service.
 * @param args.email The email of the user to find.
 */
export const findUserByEmail: FindUserByEmail = async ({ email }) => {
  return DBClient.instance.user.findUnique({ where: { email }, select: userSelect });
};

/**
 * Finds a user by id.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to find.
 * @returns The user if found, otherwise null.
 */
export const findUserById: FindUserById = ({ userId }) => {
  return DBClient.instance.user.findUnique({ where: { id: userId }, select: userSelect });
};

/**
 * Sends a confirmation email to the user using React Email and SparkPost.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to send the confirmation email to.
 * @param args.username The username of the user to send the confirmation email to.
 * @param args.email The email of the user to send the confirmation email to.
 * @returns The user if found, otherwise null.
 */
export const sendConfirmationEmail: SendConfirmationEmail = async ({
  userId,
  username,
  email,
}) => {
  const confirmationToken = generateConfirmationToken({ id: userId, username });
  const url = `${BASE_URL}/users/confirm?token=${confirmationToken}`;

  const name = username;
  const address = email;
  const subject = 'Confirm your email';

  const component = WelcomeEmail({ name, url, subject })! as ReactElement<
    unknown,
    string
  >;

  const html = render(component);
  const text = render(component, { plainText: true });

  await sendEmail({ address, subject, text, html });
};

/**
 * Sends a reset password email to the specified user.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to send the reset password email to.
 * @param args.username The username of the user to send the reset password email to.
 * @param args.email The email of the user to send the reset password email to.
 * @returns A promise that resolves to void.
 */
export const sendResetPasswordEmail: SendResetPasswordEmail = async ({
  userId,
  username,
  email,
}) => {
  const token = generateResetPasswordToken({ id: userId, username });

  const url = `${BASE_URL}/users/reset-password?token=${token}`;

  const component = ResetPasswordEmail({ name: username, url })! as ReactElement<
    unknown,
    string
  >;

  const html = render(component);
  const text = render(component, { plainText: true });

  await sendEmail({
    address: email,
    subject: 'Reset Password',
    html,
    text,
  });
};

/**
 * Updates a user to be confirmed by id.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to update.
 * @returns The user.
 */
export const updateUserToBeConfirmedById: UpdateUserToBeConfirmedById = async ({
  userId,
}) => {
  return DBClient.instance.user.update({
    where: { id: userId },
    data: { accountIsVerified: true, updatedAt: new Date() },
    select: userSelect,
  });
};

export const updateUserPassword: UpdateUserPassword = async ({ password, userId }) => {
  const hash = await hashPassword(password);

  const user = await DBClient.instance.user.update({
    where: { id: userId },
    data: { hash, updatedAt: new Date() },
    select: authUserSelect,
  });

  return user;
};

/**
 * Updates a user by id.
 *
 * @param args The arguments for service.
 * @param args.userId The id of the user to update.
 * @param args.data The data to update the user with.
 * @param args.data.email The email of the user to update.
 * @param args.data.firstName The first name of the user to update.
 * @param args.data.lastName The last name of the user to update.
 * @param args.data.username The username of the user to update.
 */
export const updateUserById: UpdateUserById = async ({ userId, data }) => {
  const user = await DBClient.instance.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const updatedFields = {
    email: data.email !== user.email,
    username: data.username !== user.username,
    firstName: data.firstName !== user.firstName,
    lastName: data.lastName !== user.lastName,
  } as const;

  if (updatedFields.email) {
    const emailIsTaken = await findUserByEmail({ email: data.email });
    if (emailIsTaken) {
      throw new ServerError('Email is already taken', 400);
    }

    await sendConfirmationEmail({
      userId,
      username: data.username,
      email: data.email,
    });
  }

  if (updatedFields.username) {
    const usernameIsTaken = await findUserByUsername({ username: data.username });
    if (usernameIsTaken) {
      throw new ServerError('Username is already taken', 400);
    }
  }

  const updatedUser = await DBClient.instance.user.update({
    where: { id: userId },
    data: {
      email: updatedFields.email ? data.email : undefined,
      username: updatedFields.username ? data.username : undefined,
      firstName: updatedFields.firstName ? data.firstName : undefined,
      lastName: updatedFields.lastName ? data.lastName : undefined,
      accountIsVerified: updatedFields.email ? false : undefined,
    },
    select: userSelect,
  });

  return updatedUser;
};
