import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';

import {
  checkIfBreweryCommentOwner,
  deleteBreweryPostComment,
  editBreweryPostComment,
} from '@/controllers/comments/brewery-comments';
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
      querySchema: z.object({ commentId: z.string().cuid(), postId: z.string().cuid() }),
    }),
    getCurrentUser,
    checkIfBreweryCommentOwner,
    deleteBreweryPostComment,
  )
  .put(
    validateRequest({
      querySchema: z.object({ commentId: z.string().cuid(), postId: z.string().cuid() }),
      bodySchema: CreateCommentValidationSchema,
    }),
    getCurrentUser,
    checkIfBreweryCommentOwner,
    editBreweryPostComment,
  );

const handler = router.handler(NextConnectOptions);
export default handler;
