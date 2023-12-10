import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerStyleQueryResult from './schema/BeerStyleQueryResult';

interface GetAllBeerStylesArgs {
  pageNum: number;
  pageSize: number;
}

const getAllBeerStyles = async ({
  pageNum,
  pageSize,
}: GetAllBeerStylesArgs): Promise<z.infer<typeof BeerStyleQueryResult>[]> => {
  const beerStyles = await DBClient.instance.beerStyle.findMany({
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

  /**
   * Prisma does not support tuples, so we have to typecast the ibuRange and abvRange
   * fields to [number, number] in order to satisfy the zod schema.
   */
  return beerStyles as Awaited<ReturnType<typeof getAllBeerStyles>>;
};

export default getAllBeerStyles;
