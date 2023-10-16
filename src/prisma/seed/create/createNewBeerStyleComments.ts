// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { BeerStyle, User } from '@prisma/client';

import DBClient from '../../DBClient';

interface CreateNewBeerCommentsArgs {
  numberOfComments: number;
  joinData: {
    beerStyles: BeerStyle[];
    users: User[];
  };
}

interface BeerStyleComment {
  content: string;
  postedById: string;
  beerStyleId: string;
  rating: number;
  createdAt: Date;
}

const createNewBeerStyleComments = async ({
  numberOfComments,
  joinData,
}: CreateNewBeerCommentsArgs) => {
  const { beerStyles, users } = joinData;
  const prisma = DBClient.instance;

  const beerStyleCommentData: BeerStyleComment[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfComments; i++) {
    const content = faker.lorem.lines(5);
    const user = users[Math.floor(Math.random() * users.length)];
    const beerStyle = beerStyles[Math.floor(Math.random() * beerStyles.length)];
    const createdAt = faker.date.past({ years: 1 });
    const rating = Math.floor(Math.random() * 5) + 1;

    beerStyleCommentData.push({
      content,
      postedById: user.id,
      beerStyleId: beerStyle.id,
      createdAt,
      rating,
    });
  }

  await prisma.beerStyleComment.createMany({
    data: beerStyleCommentData,
  });

  return prisma.beerStyleComment.findMany();
};

export default createNewBeerStyleComments;
