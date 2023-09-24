import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerStyleQueryResult from './schema/BeerStyleQueryResult';

const getBeerStyleById = async (id: string) => {
  const beerStyle = (await DBClient.instance.beerStyle.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      postedBy: { select: { id: true, username: true } },
      createdAt: true,
      updatedAt: true,
      abvRange: true,
      ibuRange: true,
      description: true,
      glassware: { select: { id: true, name: true } },
    },
  })) as z.infer<typeof BeerStyleQueryResult> | null;

  return beerStyle;
};

export default getBeerStyleById;
