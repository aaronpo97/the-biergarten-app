import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { createRouter } from 'next-connect';
import { z } from 'zod';
import { NextApiResponse } from 'next';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import { sendLikeRequest, getLikeCount } from '@/controllers/beerPostLikes';

const router = createRouter<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  getCurrentUser,
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  sendLikeRequest,
);

router.get(
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  getLikeCount,
);

const handler = router.handler(NextConnectOptions);

export default handler;
