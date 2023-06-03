// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BeerPost, User } from '@prisma/client';

import DBClient from '../../DBClient';

interface CreateNewBeerCommentsArgs {
  numberOfComments: number;
  joinData: {
    beerPosts: BeerPost[];
    users: User[];
  };
}

interface BeerCommentData {
  content: string;
  postedById: string;
  beerPostId: string;
  rating: number;
  createdAt: Date;
}

const createNewBeerComments = async ({
  numberOfComments,
  joinData,
}: CreateNewBeerCommentsArgs) => {
  const { beerPosts, users } = joinData;
  const prisma = DBClient.instance;

  const beerCommentData: BeerCommentData[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfComments; i++) {
    const content = faker.lorem.lines(5);
    const user = users[Math.floor(Math.random() * users.length)];
    const beerPost = beerPosts[Math.floor(Math.random() * beerPosts.length)];
    const createdAt = faker.date.past({ years: 1 });
    const rating = Math.floor(Math.random() * 5) + 1;

    beerCommentData.push({
      content,
      postedById: user.id,
      beerPostId: beerPost.id,
      createdAt,
      rating,
    });
  }

  await prisma.beerComment.createMany({
    data: beerCommentData,
  });

  return prisma.beerComment.findMany();
};

export default createNewBeerComments;
