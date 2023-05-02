import type { BeerPost, User } from '@prisma/client';

import DBClient from '../../DBClient';

interface BeerPostLikeData {
  beerPostId: string;
  likedById: string;
}

const createNewBeerPostLikes = async ({
  joinData: { beerPosts, users },
  numberOfLikes,
}: {
  joinData: { beerPosts: BeerPost[]; users: User[] };
  numberOfLikes: number;
}) => {
  const beerPostLikeData: BeerPostLikeData[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfLikes; i++) {
    const beerPost = beerPosts[Math.floor(Math.random() * beerPosts.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    beerPostLikeData.push({
      beerPostId: beerPost.id,
      likedById: user.id,
    });
  }

  await DBClient.instance.beerPostLike.createMany({
    data: beerPostLikeData,
  });

  return DBClient.instance.beerPostLike.findMany();
};

export default createNewBeerPostLikes;
