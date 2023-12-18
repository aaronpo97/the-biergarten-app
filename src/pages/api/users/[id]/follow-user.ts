import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { followUser } from '@/controllers/users/profile';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetUserFollowInfoRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

const router = createRouter<
  GetUserFollowInfoRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  getCurrentUser,
  followUser,
);

const handler = router.handler(NextConnectOptions);

export default handler;
