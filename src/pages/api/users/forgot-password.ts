import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { resetPassword } from '@/controllers/users/auth';
import { ResetPasswordRequest } from '@/controllers/users/auth/types';

const router = createRouter<
  ResetPasswordRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: z.object({ email: z.string().email() }) }),
  resetPassword,
);

const handler = router.handler(NextConnectOptions);
export default handler;
