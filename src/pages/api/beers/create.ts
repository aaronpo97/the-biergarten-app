import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { createRouter } from 'next-connect';

import CreateBeerPostValidationSchema from '@/services/BeerPost/schema/CreateBeerPostValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { createBeerPost } from '@/controllers/beerPosts';
import { CreateBeerPostRequest } from '@/controllers/beerPosts/types';

const router = createRouter<
  CreateBeerPostRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: CreateBeerPostValidationSchema }),
  getCurrentUser,
  createBeerPost,
);

const handler = router.handler(NextConnectOptions);
export default handler;
