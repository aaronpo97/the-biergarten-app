import { UserExtendedNextApiRequest } from '@/config/auth/types';
import validateRequest from '@/config/zod/middleware/validateRequest';
import nextConnect from 'next-connect';
import createNewBeerPost from '@/services/BeerPost/createNewBeerPost';
import BeerPostValidationSchema from '@/services/BeerPost/schema/CreateBeerPostValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import NextConnectConfig from '@/config/nextConnect/NextConnectConfig';
import getCurrentUser from '@/config/auth/middleware/getCurrentUser';

interface CreateBeerPostRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof BeerPostValidationSchema>;
}

const createBeerPost = async (
  req: CreateBeerPostRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { name, description, typeId, abv, ibu, breweryId } = req.body;

  const newBeerPost = await createNewBeerPost({
    name,
    description,
    abv,
    ibu,
    typeId,
    breweryId,
    userId: req.user!.id,
  });

  res.status(201).json({
    message: 'Beer post created successfully',
    statusCode: 201,
    payload: newBeerPost,
    success: true,
  });
};

const handler = nextConnect(NextConnectConfig).post(
  validateRequest({ bodySchema: BeerPostValidationSchema }),
  getCurrentUser,
  createBeerPost,
);

export default handler;
