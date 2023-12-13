import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ServerError from '@/config/util/ServerError';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse, NextApiRequest } from 'next';
import { z } from 'zod';
import createBeerPostLike from '@/services/likes/beer-post-like/createBeerPostLike';
import findBeerPostLikeById from '@/services/likes/beer-post-like/findBeerPostLikeById';
import getBeerPostLikeCountByBeerPostId from '@/services/likes/beer-post-like/getBeerPostLikeCount';
import removeBeerPostLikeById from '@/services/likes/beer-post-like/removeBeerPostLikeById';
import { getBeerPostById } from '@/services/posts/beer-post';
import { LikeRequest } from '../types';

export const sendBeerPostLikeRequest = async (
  req: LikeRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const id = req.query.id as string;

  const beer = await getBeerPostById({ beerPostId: id });
  if (!beer) {
    throw new ServerError('Could not find a beer post with that id.', 404);
  }

  const alreadyLiked = await findBeerPostLikeById({
    beerPostId: beer.id,
    likedById: user.id,
  });

  const jsonResponse = {
    success: true as const,
    message: '',
    statusCode: 200 as const,
  };

  if (alreadyLiked) {
    await removeBeerPostLikeById({ beerLikeId: alreadyLiked.id });
    jsonResponse.message = 'Successfully unliked beer post';
  } else {
    await createBeerPostLike({ id, user });
    jsonResponse.message = 'Successfully liked beer post';
  }

  res.status(200).json(jsonResponse);
};

export const getBeerPostLikeCount = async (
  req: NextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const id = req.query.id as string;

  const likeCount = await getBeerPostLikeCountByBeerPostId({ beerPostId: id });

  res.status(200).json({
    success: true,
    message: 'Successfully retrieved like count.',
    statusCode: 200,
    payload: { likeCount },
  });
};

export const checkIfBeerPostIsLiked = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const beerPostId = req.query.id as string;

  const alreadyLiked = await findBeerPostLikeById({ beerPostId, likedById: user.id });

  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Beer post is liked.' : 'Beer post is not liked.',
    statusCode: 200,
    payload: { isLiked: !!alreadyLiked },
  });
};
