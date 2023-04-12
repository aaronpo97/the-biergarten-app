// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { User, BeerType } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBeerTypesArgs {
  joinData: {
    users: User[];
  };
}

const createNewBeerTypes = async ({ joinData }: CreateNewBeerTypesArgs) => {
  const { users } = joinData;
  const prisma = DBClient.instance;
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
    const createdAt = faker.date.past(1);
    beerTypePromises.push(
      prisma.beerType.create({
        data: { name: type, postedBy: { connect: { id: user.id } }, createdAt },
      }),
    );
  });

  return Promise.all(beerTypePromises);
};

export default createNewBeerTypes;
