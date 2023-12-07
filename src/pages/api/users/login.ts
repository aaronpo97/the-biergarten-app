import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import { createRouter } from 'next-connect';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import LoginValidationSchema from '@/services/User/schema/LoginValidationSchema';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { authenticateUser, loginUser } from '@/controllers/users/auth';

const router = createRouter<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: LoginValidationSchema }),
  authenticateUser,
  loginUser,
);

const handler = router.handler(NextConnectOptions);
export default handler;
