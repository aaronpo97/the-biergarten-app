import BeerPostValidationSchema from '@/validation/BeerPostValidationSchema';
import DBClient from '@/prisma/DBClient';
import { NextApiHandler } from 'next';

import { z } from 'zod';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

class ServerError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = 'ServerError';
  }
}

const handler: NextApiHandler<z.infer<typeof APIResponseValidationSchema>> = async (
  req,
  res,
) => {
  try {
    const { method } = req;

    if (method !== 'POST') {
      throw new ServerError('Method not allowed', 405);
    }

    const cleanedReqBody = BeerPostValidationSchema.safeParse(req.body);
    if (!cleanedReqBody.success) {
      throw new ServerError('Invalid request body', 400);
    }

    const { name, description, typeId, abv, ibu, breweryId } = cleanedReqBody.data;
    const user = await DBClient.instance.user.findFirstOrThrow();

    const newBeerPost = await DBClient.instance.beerPost.create({
      data: {
        name,
        description,
        abv,
        ibu,
        type: {
          connect: {
            id: typeId,
          },
        },
        postedBy: {
          connect: {
            id: user.id,
          },
        },
        brewery: {
          connect: {
            id: breweryId,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Beer post created successfully',
      statusCode: 201,
      payload: newBeerPost,
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
