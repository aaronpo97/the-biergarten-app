import { BeerPost, BeerType, BreweryPost, PrismaClient, User } from '@prisma/client';

import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

const createNewUsers = () => {
  const userPromises: Promise<User>[] = [];
  Array.from({ length: 100 }).forEach(() => {
    const firstName = faker.name.firstName();
    const lastName = faker.name.lastName();
    const email = faker.internet.email(firstName, lastName, 'example.com');

    userPromises.push(
      prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          username: `${firstName[0]}.${lastName}`,
          dateOfBirth: faker.date.birthdate({ mode: 'age', min: 19 }),
        },
      }),
    );
  });
  return Promise.all(userPromises);
};

const createNewBreweryPosts = (users: User[]) => {
  const breweryPromises: Promise<BreweryPost>[] = [];

  Array.from({ length: 100 }).forEach(() => {
    const name = `${faker.commerce.productName()} Brewing Company`;
    const location = faker.address.cityName();
    const description = faker.lorem.lines();
    const user = users[Math.floor(Math.random() * users.length)];

    breweryPromises.push(
      prisma.breweryPost.create({
        data: { name, location, description, postedBy: { connect: { id: user.id } } },
      }),
    );
  });

  return Promise.all(breweryPromises);
};

const createNewBeerTypes = (users: User[]) => {
  const beerTypePromises: Promise<BeerType>[] = [];

  const types = [
    'IPA',
    'Pilsner',
    'Stout',
    'Lager',
    'Wheat Beer',
    'Belgian Ale',
    'Pale Ale',
    'Brown Ale',
    'Sour Beer',
    'Porter',
    'Bock',
    'Rauchbier',
    'Sasion',
    'Kolsch',
    'Helles',
    'Weizenbock',
    'Doppelbock',
    'Eisbock',
    'Barley Wine',
  ];

  types.forEach((type) => {
    const user = users[Math.floor(Math.random() * users.length)];
    beerTypePromises.push(
      prisma.beerType.create({
        data: { name: type, postedBy: { connect: { id: user.id } } },
      }),
    );
  });

  return Promise.all(beerTypePromises);
};

const createNewBeerPosts = (
  users: User[],
  breweryPosts: BreweryPost[],
  beerTypes: BeerType[],
) => {
  const beerPostPromises: Promise<BeerPost>[] = [];

  Array.from({ length: 100 }).forEach(() => {
    const user = users[Math.floor(Math.random() * users.length)];
    const beerType = beerTypes[Math.floor(Math.random() * beerTypes.length)];
    const breweryPost = breweryPosts[Math.floor(Math.random() * breweryPosts.length)];

    beerPostPromises.push(
      prisma.beerPost.create({
        data: {
          abv: 10,
          ibu: 10,
          name: `${faker.commerce.productName()} ${beerType.name}`,
          description: faker.lorem.lines(),
          brewery: { connect: { id: breweryPost.id } },
          postedBy: { connect: { id: user.id } },
          type: { connect: { id: beerType.id } },
        },
      }),
    );
  });

  return Promise.all(beerPostPromises);
};

async function main() {
  const users = await createNewUsers();
  const breweryPosts = await createNewBreweryPosts(users);
  const beerTypes = await createNewBeerTypes(users);
  const beerPosts = await createNewBeerPosts(users, breweryPosts, beerTypes);

  console.log({ users, breweryPosts, beerTypes, beerPosts });
}

main().then(() => {
  console.log('Seeded database.');
});
