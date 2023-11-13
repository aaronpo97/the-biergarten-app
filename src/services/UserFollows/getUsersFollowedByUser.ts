import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import FollowInfoSchema from './schema/FollowInfoSchema';

interface GetFollowingInfoByUserIdArgs {
  userId: string;
  pageNum: number;
  pageSize: number;
}
const getUsersFollowedByUser = async ({
  userId,
  pageNum,
  pageSize,
}: GetFollowingInfoByUserIdArgs): Promise<z.infer<typeof FollowInfoSchema>[]> => {
  const usersFollowedByQueriedUser = await DBClient.instance.userFollow.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    where: { following: { id: userId } },
    select: {
      follower: { select: { username: true, userAvatar: true, id: true } },
    },
  });

  return usersFollowedByQueriedUser.map((u) => u.follower);
};

export default getUsersFollowedByUser;
