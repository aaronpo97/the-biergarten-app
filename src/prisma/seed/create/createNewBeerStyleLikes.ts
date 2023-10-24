import type { BeerStyle, User } from '@prisma/client';
// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import DBClient from '../../DBClient';

interface BeerPostLikeData {
  beerStyleId: string;
  likedById: string;
  createdAt: Date;
}

interface CreateNewBeerStyleLikesArgs {
  joinData: {
    beerStyles: BeerStyle[];
    users: User[];
  };
  numberOfLikes: number;
}

const createNewBeerStyleLikes = async ({
  joinData: { beerStyles, users },
  numberOfLikes,
}: CreateNewBeerStyleLikesArgs) => {
  const beerStyleLikeData: BeerPostLikeData[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfLikes; i++) {
    const beerStyle = beerStyles[Math.floor(Math.random() * beerStyles.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const createdAt = faker.date.past({ years: 1 });
    beerStyleLikeData.push({
      beerStyleId: beerStyle.id,
      likedById: user.id,
      createdAt,
    });
  }

  await DBClient.instance.beerStyleLike.createMany({
    data: beerStyleLikeData,
  });

  return DBClient.instance.beerStyleLike.findMany();
};

export default createNewBeerStyleLikes;
