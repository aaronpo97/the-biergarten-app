import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getBeerStyles } from '@/controllers/posts/beerStyles';
import { GetAllPostsRequest } from '@/controllers/posts/types';

import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  GetAllPostsRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: PaginatedQueryResponseSchema,
  }),
  getBeerStyles,
);

const handler = router.handler();

export default handler;
