import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import FollowInfoSchema from './schema/FollowInfoSchema';

interface GetFollowingInfoByUserIdArgs {
  userId: string;
  pageNum: number;
  pageSize: number;
}
const getUsersFollowingUser = async ({
  userId,
  pageNum,
  pageSize,
}: GetFollowingInfoByUserIdArgs): Promise<z.infer<typeof FollowInfoSchema>[]> => {
  const usersFollowingQueriedUser = await DBClient.instance.userFollow.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    where: { follower: { id: userId } },
    select: {
      following: { select: { username: true, userAvatar: true, id: true } },
    },
  });

  return usersFollowingQueriedUser.map((u) => u.following);
};

export default getUsersFollowingUser;
