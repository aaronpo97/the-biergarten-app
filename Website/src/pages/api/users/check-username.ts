import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';

import { CheckUsernameRequest } from '@/controllers/users/auth/types';
import { checkUsername } from '@/controllers/users/auth';

const router = createRouter<
  CheckUsernameRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({ querySchema: z.object({ username: z.string() }) }),
  checkUsername,
);

const handler = router.handler(NextConnectOptions);

export default handler;
