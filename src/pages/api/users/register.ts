import { NextApiResponse } from 'next';
import { z } from 'zod';
import { createRouter } from 'next-connect';
import { CreateUserValidationSchema } from '@/services/User/schema/CreateUserValidationSchemas';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { registerUser } from '@/controllers/users/auth';
import { RegisterUserRequest } from '@/controllers/users/auth/types';

const router = createRouter<
  RegisterUserRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({
    bodySchema: CreateUserValidationSchema,
  }),
  registerUser,
);

const handler = router.handler(NextConnectOptions);
export default handler;
