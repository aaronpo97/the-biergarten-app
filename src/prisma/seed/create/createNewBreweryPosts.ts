// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import DBClient from '../../DBClient';
import geocode from '../../../config/mapbox/geocoder';

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

    // eslint-disable-next-line no-await-in-loop
    const geodata = await geocode(location);

    const city = geodata.text;
    const stateOrProvince = geodata.context.find((c) => c.id.startsWith('region'))?.text;
    const country = geodata.context.find((c) => c.id.startsWith('country'))?.text;
    const coordinates = geodata.center;
    const address = geodata.place_name;
    const description = faker.lorem.lines(5);
    const user = users[Math.floor(Math.random() * users.length)];
    const createdAt = faker.date.past(1);
    const dateEstablished = faker.date.past(40);

    breweryPromises.push(
      prisma.breweryPost.create({
        data: {
          name,

          city,
          stateOrProvince,
          country,
          coordinates,
          address,

          description,
          postedBy: { connect: { id: user.id } },
          createdAt,
          dateEstablished,
        },
      }),
    );
  }
  return Promise.all(breweryPromises);
};

export default createNewBreweryPosts;
