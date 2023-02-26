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

const createNewBeerPosts = async ({
  numberOfPosts,
  joinData,
}: CreateNewBeerPostsArgs) => {
  const { users, breweryPosts, beerTypes } = joinData;
  const prisma = DBClient.instance;
  const beerPostPromises = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfPosts; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const beerType = beerTypes[Math.floor(Math.random() * beerTypes.length)];
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];
    const createdAt = faker.date.past(1);
    beerPostPromises.push(
      prisma.beerPost.create({
        data: {
          abv: Math.floor(Math.random() * (12 - 4) + 4),
          ibu: Math.floor(Math.random() * (60 - 10) + 10),
          name: faker.commerce.productName(),
          description: faker.lorem.lines(42).replace(/(\r\n|\n|\r)/gm, ' '),
          brewery: { connect: { id: breweryPost.id } },
          postedBy: { connect: { id: user.id } },
          type: { connect: { id: beerType.id } },
          createdAt,
        },
      }),
    );
  }
  return Promise.all(beerPostPromises);
};

export default createNewBeerPosts;
