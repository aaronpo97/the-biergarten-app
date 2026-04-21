import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getMapBreweryPosts } from '@/controllers/posts/breweries';
import { GetBreweryPostsRequest } from '@/controllers/posts/breweries/types';

import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';

import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  GetBreweryPostsRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({ querySchema: PaginatedQueryResponseSchema }),
  getMapBreweryPosts,
);

const handler = router.handler();

export default handler;
