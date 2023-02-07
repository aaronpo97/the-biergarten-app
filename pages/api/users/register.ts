import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import ServerError from '@/config/util/ServerError';
import nc from 'next-connect';
import createNewUser from '@/services/user/createNewUser';
import CreateUserValidationSchema from '@/services/user/schema/CreateUserValidationSchema';
import NextConnectConfig from '@/config/nextConnect/NextConnectConfig';
import findUserByUsername from '@/services/user/findUserByUsername';
import findUserByEmail from '@/services/user/findUserByEmail';
import validateRequest from '@/config/zod/middleware/validateRequest';

interface RegisterUserRequest extends NextApiRequest {
  body: z.infer<typeof CreateUserValidationSchema>;
}

const registerUser = async (req: RegisterUserRequest, res: NextApiResponse) => {
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
  res.status(201).json({
    message: 'User created successfully.',
    payload: user,
    statusCode: 201,
    success: true,
  });
};

const handler = nc(NextConnectConfig).post(
  validateRequest({ bodySchema: CreateUserValidationSchema }),
  registerUser,
);

export default handler;
