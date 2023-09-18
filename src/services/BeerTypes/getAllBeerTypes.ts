import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerTypeQueryResult from './schema/BeerTypeQueryResult';

const getAllBeerTypes = async (
  pageNum: number,
  pageSize: number,
): Promise<z.infer<typeof BeerTypeQueryResult>[]> => {
  const types = await DBClient.instance.beerType.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    select: {
      id: true,
      name: true,
      postedBy: { select: { id: true, username: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  return types;
};

export default getAllBeerTypes;
