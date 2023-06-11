import { setLoginSession } from '@/config/auth/session';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import ServerError from '@/config/util/ServerError';
import { createRouter } from 'next-connect';
import createNewUser from '@/services/User/createNewUser';
import { CreateUserValidationSchema } from '@/services/User/schema/CreateUserValidationSchemas';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import findUserByUsername from '@/services/User/findUserByUsername';
import findUserByEmail from '@/services/User/findUserByEmail';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { NODE_ENV } from '@/config/env';
import sendConfirmationEmail from '@/services/User/sendConfirmationEmail';

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

  await setLoginSession(res, {
    id: user.id,
    username: user.username,
  });

  if (NODE_ENV === 'production') {
    await sendConfirmationEmail(user);
  }

  res.status(201).json({
    success: true,
    statusCode: 201,
    message: 'User registered successfully.',
    payload: user,
  });
};

const router = createRouter<
  RegisterUserRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(validateRequest({ bodySchema: CreateUserValidationSchema }), registerUser);

const handler = router.handler(NextConnectOptions);
export default handler;
