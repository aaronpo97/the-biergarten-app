import { createRouter } from 'next-connect';
import { z } from 'zod';
import { NextApiResponse } from 'next';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import {
  getBeerStyleLikeCountRequest,
  sendBeerStyleLikeRequest,
} from '@/controllers/likes/beerStyleLikes';
import { LikeRequest } from '@/controllers/likes/types';

const router = createRouter<
  LikeRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  getCurrentUser,
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  sendBeerStyleLikeRequest,
);

router.get(
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  getBeerStyleLikeCountRequest,
);

const handler = router.handler(NextConnectOptions);

export default handler;
