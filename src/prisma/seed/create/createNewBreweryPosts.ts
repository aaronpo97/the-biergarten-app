// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { Location, User } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBreweryPostsArgs {
  numberOfPosts: number;
  joinData: {
    users: User[];
    locations: Location[];
  };
}

const createNewBreweryPosts = async ({
  numberOfPosts,
  joinData,
}: CreateNewBreweryPostsArgs) => {
  const { users, locations } = joinData;

  const prisma = DBClient.instance;
  const breweryPromises = [];
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfPosts; i++) {
    const name = `${faker.commerce.productName()} Brewing Company`;
    const locationIndex = Math.floor(Math.random() * locations.length);
    const location = locations[locationIndex];
    locations.splice(locationIndex, 1); // Remove the location from the array
    const description = faker.lorem.lines(20).replace(/(\r\n|\n|\r)/gm, ' ');
    const user = users[Math.floor(Math.random() * users.length)];
    const createdAt = faker.date.past(1);
    const dateEstablished = faker.date.past(40);

    breweryPromises.push(
      prisma.breweryPost.create({
        data: {
          name,
          description,
          createdAt,
          dateEstablished,
          postedBy: { connect: { id: user.id } },
          location: { connect: { id: location.id } },
        },
      }),
    );
  }
  return Promise.all(breweryPromises);
};

export default createNewBreweryPosts;
