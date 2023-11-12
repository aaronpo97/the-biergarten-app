// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import type { User } from '@prisma/client';

import DBClient from '../../DBClient';

interface CreateNewUserFollowsArgs {
  joinData: { users: User[] };
}

interface UserFollowData {
  followerId: string;
  followingId: string;
  followedAt: Date;
}

const createNewUserFollows = async ({
  joinData: { users },
}: CreateNewUserFollowsArgs) => {
  const userFollows: UserFollowData[] = [];

  users.forEach((user) => {
    // Get 20 random users to follow.
    const randomUsers = users
      .filter((randomUser) => randomUser.id !== user.id)
      .sort(() => Math.random() - Math.random())
      .slice(0, 20);

    // Get the user to follow the random users, and the random users to follow the user.
    const data = randomUsers.flatMap((randomUser) => [
      {
        followerId: user.id,
        followingId: randomUser.id,
        followedAt: faker.date.between({ from: user.createdAt, to: new Date() }),
      },
      {
        followerId: randomUser.id,
        followingId: user.id,
        followedAt: faker.date.between({ from: randomUser.createdAt, to: new Date() }),
      },
    ]);

    userFollows.push(...data);
  });

  await DBClient.instance.userFollow.createMany({
    data: userFollows,
    skipDuplicates: true,
  });

  return DBClient.instance.userFollow.findMany();
};

export default createNewUserFollows;
