// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BeerComment, BeerPost, User } from '@prisma/client';

import DBClient from '../../DBClient';

interface CreateNewBeerCommentsArgs {
  numberOfComments: number;
  joinData: {
    beerPosts: BeerPost[];
    users: User[];
  };
}
const createNewBeerComments = async ({
  numberOfComments,
  joinData,
}: CreateNewBeerCommentsArgs) => {
  const { beerPosts, users } = joinData;
  const prisma = DBClient.instance;
  const beerCommentPromises: Promise<BeerComment>[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfComments; i++) {
    const content = faker.lorem.lines(5);
    const user = users[Math.floor(Math.random() * users.length)];
    const beerPost = beerPosts[Math.floor(Math.random() * beerPosts.length)];
    beerCommentPromises.push(
      prisma.beerComment.create({
        data: {
          content,
          postedBy: { connect: { id: user.id } },
          beerPost: { connect: { id: beerPost.id } },
        },
      }),
    );
  }
  return Promise.all(beerCommentPromises);
};

export default createNewBeerComments;
