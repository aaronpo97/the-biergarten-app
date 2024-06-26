import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getUsersFollowed } from '@/controllers/users/profile';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetUserFollowInfoRequest extends UserExtendedNextApiRequest {
  query: { id: string; page_size: string; page_num: string };
}

const router = createRouter<
  GetUserFollowInfoRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: PaginatedQueryResponseSchema.extend({ id: z.string().cuid() }),
  }),
  getUsersFollowed,
);

const handler = router.handler(NextConnectOptions);

export default handler;
