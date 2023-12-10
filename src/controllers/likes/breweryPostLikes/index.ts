import { UserExtendedNextApiRequest } from '@/config/auth/types';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse, NextApiRequest } from 'next';
import { z } from 'zod';

export const sendBreweryPostLikeRequest = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const id = req.query.id! as string;
  const user = req.user!;

  const breweryPost = await DBClient.instance.breweryPost.findUnique({
    where: { id },
  });

  if (!breweryPost) {
    throw new ServerError('Could not find a brewery post with that id', 404);
  }

  const alreadyLiked = await DBClient.instance.breweryPostLike.findFirst({
    where: { breweryPostId: breweryPost.id, likedById: user.id },
  });

  const jsonResponse = {
    success: true as const,
    message: '',
    statusCode: 200 as const,
  };

  if (alreadyLiked) {
    await DBClient.instance.breweryPostLike.delete({
      where: { id: alreadyLiked.id },
    });
    jsonResponse.message = 'Successfully unliked brewery post';
  } else {
    await DBClient.instance.breweryPostLike.create({
      data: { breweryPostId: breweryPost.id, likedById: user.id },
    });
    jsonResponse.message = 'Successfully liked brewery post';
  }

  res.status(200).json(jsonResponse);
};

export const getBreweryPostLikeCount = async (
  req: NextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const id = req.query.id! as string;

  const breweryPost = await DBClient.instance.breweryPost.findUnique({
    where: { id },
  });

  if (!breweryPost) {
    throw new ServerError('Could not find a brewery post with that id', 404);
  }

  const likeCount = await DBClient.instance.breweryPostLike.count({
    where: { breweryPostId: breweryPost.id },
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

  const alreadyLiked = await DBClient.instance.breweryPostLike.findFirst({
    where: {
      breweryPostId: id,
      likedById: user.id,
    },
  });

  res.status(200).json({
    success: true,
    message: alreadyLiked ? 'Brewery post is liked.' : 'Brewery post is not liked.',
    statusCode: 200,
    payload: { isLiked: !!alreadyLiked },
  });
};
