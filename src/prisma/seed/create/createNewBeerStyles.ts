// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import DBClient from '../../DBClient';
import beerStyles from '../util/beerStyles';

interface CreateNewBeerStylesArgs {
  joinData: { users: User[] };
}

interface BeerStyleData {
  name: string;
  postedById: string;
  description: string;
  createdAt: Date;
}

const createNewBeerStyles = async ({ joinData }: CreateNewBeerStylesArgs) => {
  const { users } = joinData;
  const prisma = DBClient.instance;

  const beerTypeData: BeerStyleData[] = [];

  beerStyles.forEach((beerStyle) => {
    const createdAt = faker.date.past({ years: 1 });
    const { description, style: name } = beerStyle;
    const user = users[Math.floor(Math.random() * users.length)];

    beerTypeData.push({
      createdAt,
      description,
      name,
      postedById: user.id,
    });
  });

  await prisma.beerStyle.createMany({ data: beerTypeData, skipDuplicates: true });
  return prisma.beerStyle.findMany();
};

export default createNewBeerStyles;
