import { UserExtendedNextApiRequest } from '@/config/auth/types';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { createRouter } from 'next-connect';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import CreateBreweryPostSchema from '@/services/BreweryPost/schema/CreateBreweryPostSchema';
import createNewBreweryPost from '@/services/BreweryPost/createNewBreweryPost';
import geocode from '@/config/mapbox/geocoder';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';

interface CreateBreweryPostRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof CreateBreweryPostSchema>;
}

const createBreweryPost = async (
  req: CreateBreweryPostRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { name, description, dateEstablished, address, city, country, region } = req.body;
  const userId = req.user!.id;

  const fullAddress = `${address}, ${city}, ${region}, ${country}`;

  const geocoded = await geocode(fullAddress);

  if (!geocoded) {
    throw new ServerError('Address is not valid', 400);
  }

  const [latitude, longitude] = geocoded.center;

  const location = await DBClient.instance.location.create({
    data: {
      address,
      city,
      country,
      stateOrProvince: region,
      coordinates: [latitude, longitude],
      postedBy: { connect: { id: userId } },
    },
    select: { id: true },
  });

  const newBreweryPost = await createNewBreweryPost({
    name,
    description,
    locationId: location.id,
    dateEstablished,
    userId,
  });

  res.status(201).json({
    message: 'Brewery post created successfully',
    statusCode: 201,
    payload: newBreweryPost,
    success: true,
  });
};

const router = createRouter<
  CreateBreweryPostRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  validateRequest({ bodySchema: CreateBreweryPostSchema }),
  getCurrentUser,
  createBreweryPost,
);

const handler = router.handler(NextConnectOptions);
export default handler;
