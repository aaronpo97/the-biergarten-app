// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';

import { User, BeerStyle, BreweryPost } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBeerPostsArgs {
  numberOfPosts: number;
  joinData: {
    users: User[];
    breweryPosts: BreweryPost[];
    beerStyles: BeerStyle[];
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
  styleId: string;
}

const createNewBeerPosts = async ({
  numberOfPosts,
  joinData,
}: CreateNewBeerPostsArgs) => {
  const { users, breweryPosts, beerStyles } = joinData;
  const prisma = DBClient.instance;
  const beerPostData: BeerPostData[] = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfPosts; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const beerStyle = beerStyles[Math.floor(Math.random() * beerStyles.length)];
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];
    const createdAt = faker.date.past({ years: 1 });

    const [minABV, maxABV] = beerStyle.abvRange;
    const [minIBU, maxIBU] = beerStyle.ibuRange;

    const abv = parseFloat((Math.random() * (maxABV - minABV) + minABV).toFixed(1));
    const ibu = Math.floor(Math.random() * (maxIBU - minIBU) + minIBU);

    const name = faker.commerce.productName();
    const description = faker.lorem.lines(20).replace(/(\r\n|\n|\r)/gm, ' ');

    beerPostData.push({
      postedById: user.id,
      styleId: beerStyle.id,
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
