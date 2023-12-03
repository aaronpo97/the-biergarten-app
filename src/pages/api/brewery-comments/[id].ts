import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import { checkIfBeerCommentOwner } from '@/controllers/beerComments';
import {
  deleteBreweryPostComment,
  editBreweryPostComment,
} from '@/controllers/breweryComments';
import { CommentRequest } from '@/controllers/requestTypes';

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
      querySchema: z.object({ id: z.string().cuid() }),
    }),
    getCurrentUser,
    checkIfBeerCommentOwner,
    deleteBreweryPostComment,
  )
  .put(
    validateRequest({
      querySchema: z.object({ id: z.string().cuid() }),
      bodySchema: CreateCommentValidationSchema,
    }),
    getCurrentUser,
    checkIfBeerCommentOwner,
    editBreweryPostComment,
  );

const handler = router.handler(NextConnectOptions);
export default handler;
