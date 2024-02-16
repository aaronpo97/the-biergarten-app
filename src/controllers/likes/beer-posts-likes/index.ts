import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ServerError from '@/config/util/ServerError';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';

import { getBeerPostById } from '@/services/posts/beer-post';
import {
  findBeerPostLikeByIdService,
  createBeerPostLikeService,
  removeBeerPostLikeService,
  getBeerPostLikeCountService,
} from '@/services/likes/beer-post-like';
import { LikeRequest } from '../types';

export const sendBeerPostLikeRequest = async (
  req: LikeRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const { postId } = req.query;

  const beer = await getBeerPostById({ beerPostId: postId });
  if (!beer) {
    throw new ServerError('Could not find a beer post with that id.', 404);
  }

  const liked = await findBeerPostLikeByIdService({
    beerPostId: beer.id,
    likedById: user.id,
  });

  if (liked) {
    await removeBeerPostLikeService({ beerPostLikeId: liked.id });
    res.status(200).json({
      success: true,
      message: 'Successfully unliked beer post.',
      statusCode: 200,
      payload: { liked: false },
    });

    return;
  }

  await createBeerPostLikeService({ beerPostId: beer.id, likedById: user.id });
  res.status(200).json({
    success: true,
    message: 'Successfully liked beer post.',
    statusCode: 200,
    payload: { liked: true },
  });
};

export const getBeerPostLikeCount = async (
  req: LikeRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { postId } = req.query;

  const likeCount = await getBeerPostLikeCountService({ beerPostId: postId });

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

  const alreadyLiked = await findBeerPostLikeByIdService({
    beerPostId,
    likedById: user.id,
  });

  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Beer post is liked.' : 'Beer post is not liked.',
    statusCode: 200,
    payload: { isLiked: !!alreadyLiked },
  });
};
