// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import DBClient from '../../DBClient';

interface CreateNewBeerTypesArgs {
  joinData: {
    users: User[];
  };
}

interface BeerTypeData {
  name: string;
  postedById: string;
  createdAt: Date;
}

const createNewBeerTypes = async ({ joinData }: CreateNewBeerTypesArgs) => {
  const { users } = joinData;
  const prisma = DBClient.instance;

  const beerTypeData: BeerTypeData[] = [];

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
    const createdAt = faker.date.past({ years: 1 });

    beerTypeData.push({
      name: type,
      postedById: user.id,
      createdAt,
    });
  });

  await prisma.beerType.createMany({ data: beerTypeData, skipDuplicates: true });
  return prisma.beerType.findMany();
};

export default createNewBeerTypes;
