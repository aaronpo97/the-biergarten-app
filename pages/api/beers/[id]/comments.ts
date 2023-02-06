import NextConnectConfig from '@/config/nextConnect/NextConnectConfig';
import ServerError from '@/config/util/ServerError';
import createNewBeerComment from '@/services/BeerComment/createNewBeerComment';
import { BeerCommentQueryResultT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import BeerCommentValidationSchema from '@/services/BeerComment/schema/CreateBeerCommentValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiHandler } from 'next';
import nextConnect from 'next-connect';
import { z } from 'zod';

const createComment: NextApiHandler<z.infer<typeof APIResponseValidationSchema>> = async (
  req,
  res,
) => {
  const cleanedReqBody = BeerCommentValidationSchema.safeParse(req.body);
  if (!cleanedReqBody.success) {
    throw new ServerError('Invalid request body', 400);
  }
  const { content, rating, beerPostId } = cleanedReqBody.data;

  const newBeerComment: BeerCommentQueryResultT = await createNewBeerComment({
    content,
    rating,
    beerPostId,
  });

  res.status(201).json({
    message: 'Beer comment created successfully',
    statusCode: 201,
    payload: newBeerComment,
    success: true,
  });
};

const handler = nextConnect(NextConnectConfig).post(createComment);

export default handler;
