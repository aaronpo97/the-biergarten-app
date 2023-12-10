import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

import { CommentRequest } from '@/controllers/comments/types';
import {
  checkIfBeerCommentOwner,
  deleteBeerPostComment,
  editBeerPostComment,
} from '@/controllers/comments/beer-comments';

const router = createRouter<
  CommentRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router
  .delete(
    validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
    getCurrentUser,
    checkIfBeerCommentOwner,
    deleteBeerPostComment,
  )
  .put(
    validateRequest({
      querySchema: z.object({ id: z.string().cuid() }),
      bodySchema: CreateCommentValidationSchema,
    }),
    getCurrentUser,
    checkIfBeerCommentOwner,
    editBeerPostComment,
  );

const handler = router.handler(NextConnectOptions);
export default handler;
