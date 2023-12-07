import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';

import { TokenValidationRequest } from '@/controllers/users/auth/types';
import { confirmUser } from '@/controllers/users/auth';
import TokenValidationSchema from '@/services/User/schema/TokenValidationSchema';

const router = createRouter<
  TokenValidationRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  getCurrentUser,
  validateRequest({ querySchema: TokenValidationSchema }),
  confirmUser,
);

const handler = router.handler(NextConnectOptions);

export default handler;
