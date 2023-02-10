import { UserExtendedNextApiRequest } from '@/config/auth/types';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { createRouter } from 'next-connect';
import createNewBeerPost from '@/services/BeerPost/createNewBeerPost';
import BeerPostValidationSchema from '@/services/BeerPost/schema/CreateBeerPostValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';

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

const router = createRouter<
  CreateBeerPostRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: BeerPostValidationSchema }),
  getCurrentUser,
  createBeerPost,
);

const handler = router.handler(NextConnectOptions);
export default handler;
