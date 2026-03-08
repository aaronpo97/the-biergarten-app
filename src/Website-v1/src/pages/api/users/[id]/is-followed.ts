import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';

import { checkIfUserIsFollowedBySessionUser } from '@/controllers/users/profile';
import { GetUserFollowInfoRequest } from '@/controllers/users/profile/types';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

const router = createRouter<
  GetUserFollowInfoRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  getCurrentUser,
  checkIfUserIsFollowedBySessionUser,
);

const handler = router.handler(NextConnectOptions);

export default handler;
