import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getBeerPosts } from '@/controllers/posts/beerPosts';
import { GetAllBeerPostsRequest } from '@/controllers/posts/beerPosts/types';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  GetAllBeerPostsRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: PaginatedQueryResponseSchema,
  }),
  getBeerPosts,
);

const handler = router.handler();

export default handler;
