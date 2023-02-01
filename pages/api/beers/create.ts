import ServerError from '@/config/util/ServerError';
import createNewBeerPost from '@/services/BeerPost/createNewBeerPost';
import BeerPostValidationSchema from '@/services/BeerPost/schema/CreateBeerPostValidationSchema';
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

    const cleanedReqBody = BeerPostValidationSchema.safeParse(req.body);
    if (!cleanedReqBody.success) {
      throw new ServerError('Invalid request body', 400);
    }

    const { name, description, typeId, abv, ibu, breweryId } = cleanedReqBody.data;
    const newBeerPost = await createNewBeerPost({
      name,
      description,
      abv,
      ibu,
      typeId,
      breweryId,
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
