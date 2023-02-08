import DBClient from '@/prisma/DBClient';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import getBeerPostById from '@/services/BeerPost/getBeerPostById';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import validateRequest from '@/config/zod/middleware/validateRequest';
import getCurrentUser from '@/config/auth/middleware/getCurrentUser';
import NextConnectConfig from '@/config/nextConnect/NextConnectConfig';
import nextConnect from 'next-connect';
import { z } from 'zod';
import { NextApiResponse } from 'next';
import ServerError from '@/config/util/ServerError';

const likeBeerPost = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const id = req.query.id as string;

  const beer = await getBeerPostById(id);
  if (!beer) {
    throw new ServerError('Could not find a beer post with that id', 404);
  }

  const alreadyLiked = await DBClient.instance.beerPostLikes.findFirst({
    where: {
      beerPostId: id,
      userId: user.id,
    },
  });

  if (alreadyLiked) {
    await DBClient.instance.beerPostLikes.delete({
      where: {
        id: alreadyLiked.id,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Successfully unliked beer post',
      statusCode: 200,
    });

    return;
  }

  await DBClient.instance.beerPostLikes.create({
    data: {
      beerPost: { connect: { id } },
      user: { connect: { id: user.id } },
    },
  });

  res.status(200).json({
    success: true,
    message: 'Successfully liked beer post',
    statusCode: 200,
  });
};

const handler = nextConnect(NextConnectConfig).post(
  getCurrentUser,
  validateRequest({
    querySchema: z.object({
      id: z.string().uuid(),
    }),
  }),
  likeBeerPost,
);

export default handler;
