import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { createRouter } from 'next-connect';
import { z } from 'zod';
import { NextApiResponse } from 'next';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import {
  sendBeerPostLikeRequest,
  getBeerPostLikeCount,
} from '@/controllers/likes/beer-posts-likes';
import { LikeRequest } from '@/controllers/likes/types';

const router = createRouter<
  LikeRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  getCurrentUser,
  validateRequest({ querySchema: z.object({ postId: z.string().cuid() }) }),
  sendBeerPostLikeRequest,
);

router.get(
  validateRequest({ querySchema: z.object({ postId: z.string().cuid() }) }),
  getBeerPostLikeCount,
);

const handler = router.handler(NextConnectOptions);

export default handler;
