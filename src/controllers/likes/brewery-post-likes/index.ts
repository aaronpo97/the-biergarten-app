import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ServerError from '@/config/util/ServerError';

import {
  createBreweryPostLikeService,
  findBreweryPostLikeService,
  getBreweryPostLikeCountService,
  removeBreweryPostLikeService,
} from '@/services/likes/brewery-post-like';
import { getBreweryPostByIdService } from '@/services/posts/brewery-post';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse, NextApiRequest } from 'next';
import { z } from 'zod';

export const sendBreweryPostLikeRequest = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const id = req.query.id! as string;
  const user = req.user!;

  const breweryPost = await getBreweryPostByIdService({ breweryPostId: id });

  if (!breweryPost) {
    throw new ServerError('Could not find a brewery post with that id', 404);
  }

  const like = await findBreweryPostLikeService({
    breweryPostId: breweryPost.id,
    likedById: user.id,
  });

  if (like) {
    await removeBreweryPostLikeService({ breweryPostLikeId: like.id });
    res.status(200).json({
      success: true,
      message: 'Successfully removed like from brewery post.',
      statusCode: 200,
    });

    return;
  }

  await createBreweryPostLikeService({
    breweryPostId: breweryPost.id,
    likedById: user.id,
  });
  res.status(200).json({
    success: true,
    message: 'Successfully liked brewery post.',
    statusCode: 200,
  });
};

export const getBreweryPostLikeCount = async (
  req: NextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const id = req.query.id! as string;

  const breweryPost = await getBreweryPostByIdService({ breweryPostId: id });
  if (!breweryPost) {
    throw new ServerError('Could not find a brewery post with that id', 404);
  }

  const likeCount = await getBreweryPostLikeCountService({
    breweryPostId: breweryPost.id,
  });

  res.status(200).json({
    success: true,
    message: 'Successfully retrieved like count',
    statusCode: 200,
    payload: { likeCount },
  });
};

export const getBreweryPostLikeStatus = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const id = req.query.id as string;

  const liked = await findBreweryPostLikeService({
    breweryPostId: id,
    likedById: user.id,
  });

  res.status(200).json({
    success: true,
    message: liked ? 'Brewery post is liked.' : 'Brewery post is not liked.',
    statusCode: 200,
    payload: { isLiked: !!liked },
  });
};
