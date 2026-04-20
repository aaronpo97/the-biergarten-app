import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getUserFollowers } from '@/controllers/users/profile';
import { GetUserFollowInfoRequest } from '@/controllers/users/profile/types';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  GetUserFollowInfoRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: PaginatedQueryResponseSchema.extend({ id: z.string().cuid() }),
  }),
  getUserFollowers,
);

const handler = router.handler(NextConnectOptions);

export default handler;
