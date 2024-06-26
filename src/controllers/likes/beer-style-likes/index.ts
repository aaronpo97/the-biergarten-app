import ServerError from '@/config/util/ServerError';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import {
  createBeerStyleLikeService,
  findBeerStyleLikeService,
  getBeerStyleLikeCountService,
  removeBeerStyleLikeService,
} from '@/services/likes/beer-style-like';
import { getBeerStyleByIdService } from '@/services/posts/beer-style-post';
import { LikeRequest } from '../types';

export const sendBeerStyleLikeRequest = async (
  req: LikeRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const { postId } = req.query;

  const beerStyle = await getBeerStyleByIdService({ beerStyleId: postId });
  if (!beerStyle) {
    throw new ServerError('Could not find a beer style with that id.', 404);
  }

  const beerStyleLike = await findBeerStyleLikeService({
    beerStyleId: beerStyle.id,
    likedById: user.id,
  });

  if (beerStyleLike) {
    await removeBeerStyleLikeService({ beerStyleLikeId: beerStyleLike.id });
    res.status(200).json({
      message: 'Successfully unliked beer style.',
      success: true,
      statusCode: 200,
    });
  } else {
    await createBeerStyleLikeService({ beerStyleId: beerStyle.id, likedById: user.id });
    res.status(200).json({
      message: 'Successfully liked beer style.',
      success: true,
      statusCode: 200,
    });
  }
};

export const getBeerStyleLikeCountRequest = async (
  req: LikeRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { postId } = req.query;
  const likeCount = await getBeerStyleLikeCountService({ beerStyleId: postId });

  res.status(200).json({
    success: true,
    message: 'Successfully retrieved like count.',
    statusCode: 200,
    payload: { likeCount },
  });
};

export const checkIfBeerStyleIsLiked = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const beerStyleId = req.query.id as string;

  const alreadyLiked = await findBeerStyleLikeService({
    beerStyleId,
    likedById: user.id,
  });
  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Beer style is liked.' : 'Beer style is not liked.',
    statusCode: 200,
    payload: { isLiked: !!alreadyLiked },
  });
};
