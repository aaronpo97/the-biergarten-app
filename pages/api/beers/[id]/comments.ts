import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import createNewBeerComment from '@/services/BeerComment/createNewBeerComment';
import { BeerCommentQueryResultT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import BeerCommentValidationSchema from '@/services/BeerComment/schema/CreateBeerCommentValidationSchema';

import { createRouter } from 'next-connect';
import { z } from 'zod';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import { NextApiResponse } from 'next';

interface CreateCommentRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof BeerCommentValidationSchema>;
}

const createComment = async (
  req: CreateCommentRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { content, rating, beerPostId } = req.body;

  const newBeerComment: BeerCommentQueryResultT = await createNewBeerComment({
    content,
    rating,
    beerPostId,
    userId: req.user!.id,
  });

  res.status(201).json({
    message: 'Beer comment created successfully',
    statusCode: 201,
    payload: newBeerComment,
    success: true,
  });
};

const router = createRouter<
  CreateCommentRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: BeerCommentValidationSchema }),
  getCurrentUser,
  createComment,
);

const handler = router.handler(NextConnectOptions);
export default handler;
