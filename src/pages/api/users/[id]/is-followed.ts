import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import getCurrentUser from '@/config/nextConnect/middleware/getCurrentUser';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import findUserById from '@/services/User/findUserById';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetUserFollowInfoRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

const router = createRouter<
  GetUserFollowInfoRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

const checkIfUserIsFollowedBySessionUser = async (
  req: GetUserFollowInfoRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const user = await findUserById(id);
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const currentUser = req.user!;

  const userIsFollowedBySessionUser = await DBClient.instance.userFollow.findFirst({
    where: { followerId: currentUser.id, followingId: id },
  });

  if (!userIsFollowedBySessionUser) {
    res.status(200).json({
      message: 'User is not followed by the current user.',
      success: true,
      statusCode: 200,
      payload: { isFollowed: false },
    });

    return;
  }

  res.status(200).json({
    message: 'User is followed by the current user.',
    success: true,
    statusCode: 200,
    payload: { isFollowed: true },
  });
};

router.get(
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  getCurrentUser,
  checkIfUserIsFollowedBySessionUser,
);

const handler = router.handler(NextConnectOptions);

export default handler;
