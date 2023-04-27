// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';

import { User, BeerType, BreweryPost } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBeerPostsArgs {
  numberOfPosts: number;
  joinData: {
    users: User[];
    breweryPosts: BreweryPost[];
    beerTypes: BeerType[];
  };
}

interface BeerPostData {
  abv: number;
  ibu: number;
  name: string;
  description: string;
  createdAt: Date;
  breweryId: string;
  postedById: string;
  typeId: string;
}

const createNewBeerPosts = async ({
  numberOfPosts,
  joinData,
}: CreateNewBeerPostsArgs) => {
  const { users, breweryPosts, beerTypes } = joinData;
  const prisma = DBClient.instance;
  const beerPostData: BeerPostData[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfPosts; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const beerType = beerTypes[Math.floor(Math.random() * beerTypes.length)];
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];
    const createdAt = faker.date.past(1);

    const abv = Math.floor(Math.random() * (12 - 4) + 4);
    const ibu = Math.floor(Math.random() * (60 - 10) + 10);
    const name = faker.commerce.productName();
    const description = faker.lorem.lines(20).replace(/(\r\n|\n|\r)/gm, ' ');

    beerPostData.push({
      postedById: user.id,
      typeId: beerType.id,
      breweryId: breweryPost.id,
      createdAt,
      abv,
      ibu,
      name,
      description,
    });
  }

  await prisma.beerPost.createMany({ data: beerPostData });
  return prisma.beerPost.findMany();
};

export default createNewBeerPosts;
