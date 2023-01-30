import DBClient from '@/prisma/DBClient';
import { NextApiHandler } from 'next';

import { z } from 'zod';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import ServerError from '@/config/util/ServerError';
import BeerCommentValidationSchema from '@/validation/CreateBeerCommentValidationSchema';

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

    const user = await DBClient.instance.user.findFirstOrThrow();

    const { content, rating, beerPostId } = cleanedReqBody.data;
    const newBeerComment = await DBClient.instance.beerComment.create({
      data: {
        content,
        rating,
        beerPost: { connect: { id: beerPostId } },
        postedBy: { connect: { id: user.id } },
      },
      select: {
        id: true,
        content: true,
        rating: true,
        postedBy: {
          select: {
            id: true,
            username: true,
          },
        },
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'Beer comment created successfully',
      statusCode: 201,
      payload: newBeerComment.id,
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
