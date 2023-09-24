import { z } from 'zod';
import DBClient from '@/prisma/DBClient';
import BeerStyleQueryResult from './schema/BeerStyleQueryResult';

const deleteBeerStyleById = async (id: string) => {
  const deleted = await DBClient.instance.beerStyle.delete({
    where: { id },
    select: {
      id: true,
      name: true,
      createdAt: true,
      updatedAt: true,
      abvRange: true,
      ibuRange: true,
      description: true,
      postedBy: { select: { id: true, username: true } },
      glassware: { select: { id: true, name: true } },
    },
  });

  return deleted as z.infer<typeof BeerStyleQueryResult> | null;
};

export default deleteBeerStyleById;
