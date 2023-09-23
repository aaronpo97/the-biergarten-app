// eslint-disable-next-line import/no-extraneous-dependencies
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import uniq from 'lodash/uniq';
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
  glasswareId: string;
  abvRange: [number, number];
  ibuRange: [number, number];
}

const createNewBeerStyles = async ({ joinData }: CreateNewBeerStylesArgs) => {
  const { users } = joinData;
  const prisma = DBClient.instance;

  const glasswarePromises: Promise<{
    id: string;
    description: string;
    name: string;
  }>[] = [];

  const glasswareData = uniq(beerStyles.map((beerStyle) => beerStyle.glassware));

  glasswareData.forEach((glassware) => {
    const createdAt = faker.date.past({ years: 1 });
    const user = users[Math.floor(Math.random() * users.length)];
    const query = prisma.glassware.create({
      data: {
        createdAt,
        description: faker.lorem.paragraph(),
        name: glassware,
        postedById: user.id,
      },
      select: { id: true, description: true, name: true },
    });

    glasswarePromises.push(query);
  });

  const glassware = await Promise.all(glasswarePromises);

  const beerStyleData: BeerStyleData[] = [];
  beerStyles.forEach((beerStyle) => {
    const { description, name, ibuRange, abvRange } = beerStyle;
    const glasswareId = glassware.find((glass) => glass.name === beerStyle.glassware)!.id;

    const createdAt = faker.date.past({ years: 1 });
    const user = users[Math.floor(Math.random() * users.length)];

    beerStyleData.push({
      createdAt,
      description,
      name,
      postedById: user.id,
      glasswareId,
      ibuRange,
      abvRange,
    });
  });

  await prisma.beerStyle.createMany({ data: beerStyleData, skipDuplicates: true });
  return prisma.beerStyle.findMany();
};

export default createNewBeerStyles;
