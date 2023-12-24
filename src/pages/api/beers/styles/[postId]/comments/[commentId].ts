import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import {
  checkIfBeerStyleCommentOwner,
  deleteBeerStyleComment,
  editBeerStyleComment,
} from '@/controllers/comments/beer-style-comments';
import { CommentRequest } from '@/controllers/comments/types';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  CommentRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router
  .delete(
    validateRequest({
      querySchema: z.object({ postId: z.string().cuid(), commentId: z.string().cuid() }),
    }),
    getCurrentUser,
    checkIfBeerStyleCommentOwner,
    deleteBeerStyleComment,
  )
  .put(
    validateRequest({
      querySchema: z.object({ postId: z.string().cuid(), commentId: z.string().cuid() }),
      bodySchema: CreateCommentValidationSchema,
    }),
    getCurrentUser,
    checkIfBeerStyleCommentOwner,
    editBeerStyleComment,
  );

const handler = router.handler(NextConnectOptions);
export default handler;
