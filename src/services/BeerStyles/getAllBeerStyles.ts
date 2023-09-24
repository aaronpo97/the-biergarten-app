import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerStyleQueryResult from './schema/BeerStyleQueryResult';

const getAllBeerStyles = async (
  pageNum: number,
  pageSize: number,
): Promise<z.infer<typeof BeerStyleQueryResult>[]> => {
  const styles = await DBClient.instance.beerStyle.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
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
  });

  return styles as z.infer<typeof BeerStyleQueryResult>[];
};

export default getAllBeerStyles;
