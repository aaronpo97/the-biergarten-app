import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerStyleQueryResult from './schema/BeerStyleQueryResult';

const getBeerStyleById = async (
  id: string,
): Promise<z.infer<typeof BeerStyleQueryResult> | null> => {
  const beerStyle = await DBClient.instance.beerStyle.findUnique({
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
  });

  /**
   * Prisma does not support tuples, so we have to typecast the ibuRange and abvRange
   * fields to [number, number] in order to satisfy the zod schema.
   */
  return beerStyle as Awaited<ReturnType<typeof getBeerStyleById>>;
};

export default getBeerStyleById;
