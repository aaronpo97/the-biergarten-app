import ServerError from '@/config/util/ServerError';
import createBeerStyleLike from '@/services/likes/beer-style-like/createBeerStyleLike';
import findBeerStyleLikeById from '@/services/likes/beer-style-like/findBeerStyleLikeById';
import getBeerStyleLikeCount from '@/services/likes/beer-style-like/getBeerStyleLikeCount';
import removeBeerStyleLikeById from '@/services/likes/beer-style-like/removeBeerStyleLikeById';
import getBeerStyleById from '@/services/posts/beer-style-post/getBeerStyleById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse, NextApiRequest } from 'next';
import { z } from 'zod';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { LikeRequest } from '../types';

export const sendBeerStyleLikeRequest = async (
  req: LikeRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const { id } = req.query;

  const beerStyle = await getBeerStyleById(id);
  if (!beerStyle) {
    throw new ServerError('Could not find a beer style with that id.', 404);
  }

  const beerStyleLike = await findBeerStyleLikeById({
    beerStyleId: beerStyle.id,
    likedById: user.id,
  });

  if (beerStyleLike) {
    await removeBeerStyleLikeById({ beerStyleLikeId: beerStyleLike.id });
    res.status(200).json({
      message: 'Successfully unliked beer style.',
      success: true,
      statusCode: 200,
    });
  } else {
    await createBeerStyleLike({ beerStyleId: beerStyle.id, user });
    res.status(200).json({
      message: 'Successfully liked beer style.',
      success: true,
      statusCode: 200,
    });
  }
};

export const getBeerStyleLikeCountRequest = async (
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

export const checkIfBeerStyleIsLiked = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const beerStyleId = req.query.id as string;

  const alreadyLiked = await findBeerStyleLikeById({ beerStyleId, likedById: user.id });
  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Beer style is liked.' : 'Beer style is not liked.',
    statusCode: 200,
    payload: { isLiked: !!alreadyLiked },
  });
};
