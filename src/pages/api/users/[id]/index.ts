import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import deleteUserById from '@/services/User/deleteUserById';
import findUserByEmail from '@/services/User/findUserByEmail';
import findUserById from '@/services/User/findUserById';
import findUserByUsername from '@/services/User/findUserByUsername';
import { BaseCreateUserSchema } from '@/services/User/schema/CreateUserValidationSchemas';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { NextApiResponse } from 'next';
import { NextHandler, createRouter } from 'next-connect';
import { z } from 'zod';

const EditUserSchema = BaseCreateUserSchema.pick({
  username: true,
  email: true,
  firstName: true,
  lastName: true,
});

interface UserRouteRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

interface EditUserRequest extends UserRouteRequest {
  body: z.infer<typeof EditUserSchema>;
}

const checkIfUserCanEditUser = async (
  req: EditUserRequest,
  res: NextApiResponse,
  next: NextHandler,
) => {
  const authenticatedUser = req.user!;

  const userToUpdate = await findUserById(req.query.id);
  if (!userToUpdate) {
    throw new ServerError('User not found', 404);
  }

  if (authenticatedUser.id !== userToUpdate.id) {
    throw new ServerError('You are not permitted to modify this user', 403);
  }

  return next();
};

const editUser = async (
  req: EditUserRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { email, firstName, lastName, username } = req.body;

  const [usernameIsTaken, emailIsTaken] = await Promise.all([
    findUserByUsername(username),
    findUserByEmail(email),
  ]);

  const emailChanged = req.user!.email !== email;
  const usernameChanged = req.user!.username !== username;

  if (emailIsTaken && emailChanged) {
    throw new ServerError('Email is already taken', 400);
  }

  if (usernameIsTaken && usernameChanged) {
    throw new ServerError('Username is already taken', 400);
  }

  const updatedUser = await DBClient.instance.user.update({
    where: { id: req.user!.id },
    data: {
      email,
      firstName,
      lastName,
      username,
      accountIsVerified: emailChanged ? false : undefined,
    },
  });

  res.json({
    message: 'User edited successfully',
    payload: updatedUser,
    success: true,
    statusCode: 200,
  });
};

const deleteUser = async (
  req: UserRouteRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;
  const deletedUser = await deleteUserById(id);

  if (!deletedUser) {
    throw new ServerError('Could not find a user with that id.', 400);
  }

  res.send({
    message: 'Successfully deleted user.',
    statusCode: 200,
    success: true,
  });
};

const router = createRouter<
  EditUserRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.put(
  getCurrentUser,
  validateRequest({
    bodySchema: EditUserSchema,
    querySchema: z.object({ id: z.string().cuid() }),
  }),
  checkIfUserCanEditUser,
  editUser,
);

router.delete(
  getCurrentUser,
  validateRequest({
    querySchema: z.object({ id: z.string().cuid() }),
  }),
  checkIfUserCanEditUser,
  deleteUser,
);

const handler = router.handler(NextConnectOptions);

export default handler;
