import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { GetAllPostsByConnectedPostId } from '@/controllers/posts/types';
import { getBeerPostsByUserId } from '@/controllers/posts/beerPosts';

const router = createRouter<
  GetAllPostsByConnectedPostId,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: PaginatedQueryResponseSchema.extend({ id: z.string().cuid() }),
  }),
  getBeerPostsByUserId,
);

const handler = router.handler();

export default handler;
