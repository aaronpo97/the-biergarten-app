import type { BeerPost, BeerPostLike, User } from '@prisma/client';
import DBClient from '../../DBClient';

const createNewBeerPostLikes = async ({
  joinData: { beerPosts, users },
  numberOfLikes,
}: {
  joinData: {
    beerPosts: BeerPost[];
    users: User[];
  };
  numberOfLikes: number;
}) => {
  const beerPostLikePromises: Promise<BeerPostLike>[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfLikes; i++) {
    const beerPost = beerPosts[Math.floor(Math.random() * beerPosts.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    beerPostLikePromises.push(
      DBClient.instance.beerPostLike.create({
        data: {
          beerPost: { connect: { id: beerPost.id } },
          user: { connect: { id: user.id } },
        },
      }),
    );
  }

  return Promise.all(beerPostLikePromises);
};

export default createNewBeerPostLikes;
