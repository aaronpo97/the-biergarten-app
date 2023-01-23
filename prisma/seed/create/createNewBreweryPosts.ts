// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBreweryPostsArgs {
  numberOfPosts: number;
  joinData: {
    users: User[];
  };
}

const createNewBreweryPosts = async ({
  numberOfPosts,
  joinData,
}: CreateNewBreweryPostsArgs) => {
  const { users } = joinData;
  const prisma = DBClient.instance;
  const breweryPromises = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfPosts; i++) {
    const name = `${faker.commerce.productName()} Brewing Company`;
    const location = faker.address.cityName();
    const description = faker.lorem.lines(5);
    const user = users[Math.floor(Math.random() * users.length)];

    breweryPromises.push(
      prisma.breweryPost.create({
        data: { name, location, description, postedBy: { connect: { id: user.id } } },
      }),
    );
  }
  return Promise.all(breweryPromises);
};

export default createNewBreweryPosts;
