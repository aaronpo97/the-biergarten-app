import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

import { checkIfBeerPostIsLiked } from '@/controllers/likes/beer-posts-likes';

const router = createRouter<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  getCurrentUser,
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  checkIfBeerPostIsLiked,
);

const handler = router.handler(NextConnectOptions);
export default handler;
