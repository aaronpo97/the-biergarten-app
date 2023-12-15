import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { createRouter } from 'next-connect';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import CreateBreweryPostSchema from '@/services/posts/brewery-post/schema/CreateBreweryPostSchema';

import { CreateBreweryPostRequest } from '@/controllers/posts/breweries/types';
import { createBreweryPost } from '@/controllers/posts/breweries';

const router = createRouter<
  CreateBreweryPostRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: CreateBreweryPostSchema }),
  getCurrentUser,
  createBreweryPost,
);

const handler = router.handler(NextConnectOptions);
export default handler;
