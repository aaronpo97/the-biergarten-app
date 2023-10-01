import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerStyleQueryResult from './schema/BeerStyleQueryResult';

const getAllBeerStyles = async ({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}): Promise<z.infer<typeof BeerStyleQueryResult>[]> =>
  DBClient.instance.beerStyle.findMany({
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
  }) as ReturnType<typeof getAllBeerStyles>;

export default getAllBeerStyles;
