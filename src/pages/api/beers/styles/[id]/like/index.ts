import { createRouter } from 'next-connect';
import { z } from 'zod';
import { NextApiRequest, NextApiResponse } from 'next';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ServerError from '@/config/util/ServerError';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';

import getBeerStyleById from '@/services/BeerStyles/getBeerStyleById';
import findBeerStyleLikeById from '@/services/BeerStyleLike/findBeerStyleLikeById';
import getBeerStyleLikeCount from '@/services/BeerStyleLike/getBeerStyleLikeCount';
import createBeerStyleLike from '@/services/BeerStyleLike/createBeerStyleLike';
import removeBeerStyleLikeById from '@/services/BeerStyleLike/removeBeerStyleLikeById';

const sendLikeRequest = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const id = req.query.id as string;

  const beerStyle = await getBeerStyleById(id);
  if (!beerStyle) {
    throw new ServerError('Could not find a beer style with that id', 404);
  }

  const alreadyLiked = await findBeerStyleLikeById({
    beerStyleId: beerStyle.id,
    likedById: user.id,
  });

  const jsonResponse = {
    success: true as const,
    message: '',
    statusCode: 200 as const,
  };

  if (alreadyLiked) {
    await removeBeerStyleLikeById({ beerStyleLikeId: alreadyLiked.id });
    jsonResponse.message = 'Successfully unliked beer style.';
  } else {
    await createBeerStyleLike({ beerStyleId: beerStyle.id, user });
    jsonResponse.message = 'Successfully liked beer style.';
  }

  res.status(200).json(jsonResponse);
};

const getLikeCount = async (
  req: NextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const id = req.query.id as string;

  const likeCount = await getBeerStyleLikeCount({ beerStyleId: id });
  res.status(200).json({
    success: true,
    message: 'Successfully retrieved like count.',
    statusCode: 200,
    payload: { likeCount },
  });
};

const router = createRouter<
  UserExtendedNextApiRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.post(
  getCurrentUser,
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  sendLikeRequest,
);

router.get(
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  getLikeCount,
);

const handler = router.handler(NextConnectOptions);

export default handler;
