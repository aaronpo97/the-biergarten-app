import ServerError from '@/config/util/ServerError';
import createNewBeerComment from '@/services/BeerComment/createNewBeerComment';
import { BeerCommentQueryResultT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import BeerCommentValidationSchema from '@/services/BeerComment/schema/CreateBeerCommentValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiHandler } from 'next';
import { z } from 'zod';

const handler: NextApiHandler<z.infer<typeof APIResponseValidationSchema>> = async (
  req,
  res,
) => {
  try {
    const { method } = req;

    if (method !== 'POST') {
      throw new ServerError('Method not allowed', 405);
    }

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
  } catch (error) {
    if (error instanceof ServerError) {
      res.status(error.statusCode).json({
        message: error.message,
        statusCode: error.statusCode,
        payload: null,
        success: false,
      });
    } else {
      res.status(500).json({
        message: 'Internal server error',
        statusCode: 500,
        payload: null,
        success: false,
      });
    }
  }
};

export default handler;
