import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { CheckEmailRequest } from '@/controllers/users/auth/types';
import { checkEmail } from '@/controllers/users/auth';

const router = createRouter<
  CheckEmailRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({ querySchema: z.object({ email: z.string().email() }) }),
  checkEmail,
);

const handler = router.handler(NextConnectOptions);

export default handler;
