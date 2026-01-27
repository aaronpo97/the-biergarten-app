import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { updatePassword } from '@/controllers/users/auth';
import { UpdatePasswordRequest } from '@/controllers/users/auth/types';
import { UpdatePasswordSchema } from '@/services/users/auth/schema/CreateUserValidationSchemas';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  UpdatePasswordRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.put(
  validateRequest({ bodySchema: UpdatePasswordSchema }),
  getCurrentUser,
  updatePassword,
);

const handler = router.handler(NextConnectOptions);
export default handler;
