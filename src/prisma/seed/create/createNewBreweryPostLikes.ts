import type { BreweryPost, BreweryPostLike, User } from '@prisma/client';
import DBClient from '../../DBClient';

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
  const breweryPostLikePromises: Promise<BreweryPostLike>[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfLikes; i++) {
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];
    const user = users[Math.floor(Math.random() * users.length)];

    breweryPostLikePromises.push(
      DBClient.instance.breweryPostLike.create({
        data: {
          breweryPost: { connect: { id: breweryPost.id } },
          likedBy: { connect: { id: user.id } },
        },
      }),
    );
  }

  return Promise.all(breweryPostLikePromises);
};

export default createNewBreweryPostLikes;
