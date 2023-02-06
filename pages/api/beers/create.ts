import nextConnect from 'next-connect';
import ServerError from '@/config/util/ServerError';
import createNewBeerPost from '@/services/BeerPost/createNewBeerPost';
import BeerPostValidationSchema from '@/services/BeerPost/schema/CreateBeerPostValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiHandler } from 'next';
import { z } from 'zod';
import NextConnectConfig from '@/config/nextConnect/NextConnectConfig';

const createBeerPost: NextApiHandler<
  z.infer<typeof APIResponseValidationSchema>
> = async (req, res) => {
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
};

const handler = nextConnect(NextConnectConfig).post(createBeerPost);

export default handler;
