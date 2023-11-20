import { UserExtendedNextApiRequest } from '@/config/auth/types';
import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import ServerError from '@/config/util/ServerError';
import DBClient from '@/prisma/DBClient';
import findUserById from '@/services/User/findUserById';
import getUsersFollowingUser from '@/services/UserFollows/getUsersFollowingUser';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetUserFollowInfoRequest extends UserExtendedNextApiRequest {
  query: { id: string; page_size: string; page_num: string };
}

const router = createRouter<
  GetUserFollowInfoRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

const getFollowingInfo = async (
  req: GetUserFollowInfoRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { id, page_num, page_size } = req.query;

  const user = await findUserById(id);
  if (!user) {
    throw new ServerError('User not found', 404);
  }

  const pageNum = parseInt(page_num, 10);
  const pageSize = parseInt(page_size, 10);

  const following = await getUsersFollowingUser({
    userId: id,
    pageNum,
    pageSize,
  });
  const followingCount = await DBClient.instance.userFollow.count({
    where: { following: { id } },
  });

  res.setHeader('X-Total-Count', followingCount);

  res.json({
    message: 'Retrieved users that are followed by queried user',
    payload: following,
    success: true,
    statusCode: 200,
  });
};

router.get(
  validateRequest({
    querySchema: z.object({
      id: z.string().cuid(),
      page_size: z.string().regex(/^\d+$/),
      page_num: z.string().regex(/^\d+$/),
    }),
  }),
  getFollowingInfo,
);

const handler = router.handler(NextConnectOptions);

export default handler;
