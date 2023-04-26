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

    const abv = Math.floor(Math.random() * (12 - 4) + 4);
    const ibu = Math.floor(Math.random() * (60 - 10) + 10);
    const name = faker.commerce.productName();
    const description = faker.lorem.lines(20).replace(/(\r\n|\n|\r)/gm, ' ');

    beerPostPromises.push(
      prisma.beerPost.create({
        data: {
          abv,
          ibu,
          name,
          description,
          createdAt,
          brewery: { connect: { id: breweryPost.id } },
          postedBy: { connect: { id: user.id } },
          type: { connect: { id: beerType.id } },
        },
      }),
    );
  }
  return Promise.all(beerPostPromises);
};

export default createNewBeerPosts;
