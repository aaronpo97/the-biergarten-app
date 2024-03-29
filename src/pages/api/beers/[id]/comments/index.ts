import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';

import { createRouter } from 'next-connect';
import { z } from 'zod';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { NextApiResponse } from 'next';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import {
  createBeerPostComment,
  getAllBeerPostComments,
} from '@/controllers/comments/beer-comments';

const router = createRouter<
  // @TODO: Fix this any type
  any,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({
    bodySchema: CreateCommentValidationSchema,
    querySchema: z.object({ id: z.string().cuid() }),
  }),
  getCurrentUser,
  createBeerPostComment,
);

router.get(
  validateRequest({
    querySchema: z.object({
      id: z.string().cuid(),
      page_size: z.coerce.number().int().positive(),
      page_num: z.coerce.number().int().positive(),
    }),
  }),
  getAllBeerPostComments,
);

const handler = router.handler(NextConnectOptions);
export default handler;
