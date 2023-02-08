import getCurrentUser from '@/config/auth/middleware/getCurrentUser';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectConfig from '@/config/nextConnect/NextConnectConfig';
import validateRequest from '@/config/zod/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import nextConnect from 'next-connect';
import { z } from 'zod';

const checkIfLiked = async (
  req: UserExtendedNextApiRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const user = req.user!;
  const id = req.query.id as string;

  const alreadyLiked = await DBClient.instance.beerPostLikes.findFirst({
    where: {
      beerPostId: id,
      userId: user.id,
    },
  });

  res.status(200).json({
    success: true,
    message: 'Successfully checked if beer post is liked by the current user',
    statusCode: 200,
    payload: {
      isLiked: !!alreadyLiked,
    },
  });
};

const handler = nextConnect(NextConnectConfig).get(
  getCurrentUser,
  validateRequest({
    querySchema: z.object({
      id: z.string().uuid(),
    }),
  }),
  checkIfLiked,
);

export default handler;
