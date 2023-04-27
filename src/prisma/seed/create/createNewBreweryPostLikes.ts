import type { BreweryPost, User } from '@prisma/client';
import DBClient from '../../DBClient';

interface BreweryPostLikeData {
  breweryPostId: string;
  likedById: string;
}

const createNewBreweryPostLikes = async ({
  joinData: { breweryPosts, users },
  numberOfLikes,
}: {
  joinData: {
    breweryPosts: BreweryPost[];
    users: User[];
  };
  numberOfLikes: number;
}) => {
  const breweryPostLikeData: BreweryPostLikeData[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfLikes; i++) {
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    breweryPostLikeData.push({
      breweryPostId: breweryPost.id,
      likedById: user.id,
    });
  }
  await DBClient.instance.breweryPostLike.createMany({
    data: breweryPostLikeData,
  });

  return DBClient.instance.breweryPostLike.findMany();
};

export default createNewBreweryPostLikes;
