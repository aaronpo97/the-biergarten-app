import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { createBeerStyle } from '@/controllers/posts/beer-styles';
import { CreateBeerStyleRequest } from '@/controllers/posts/beer-styles/types';
import CreateBeerStyleValidationSchema from '@/services/posts/beer-style-post/schema/CreateBeerStyleValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  CreateBeerStyleRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: CreateBeerStyleValidationSchema }),
  getCurrentUser,
  createBeerStyle,
);

const handler = router.handler();

export default handler;
