import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import {
  sendBreweryPostLikeRequest,
  getBreweryPostLikeCount,
} from '@/controllers/likes/brewery-post-likes';
import { LikeRequest } from '@/controllers/likes/types';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  LikeRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  getCurrentUser,
  validateRequest({ querySchema: z.object({ postId: z.string().cuid() }) }),
  sendBreweryPostLikeRequest,
);

router.get(
  validateRequest({ querySchema: z.object({ postId: z.string().cuid() }) }),
  getBreweryPostLikeCount,
);

const handler = router.handler(NextConnectOptions);

export default handler;
