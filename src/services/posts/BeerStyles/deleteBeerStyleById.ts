import { z } from 'zod';
import DBClient from '@/prisma/DBClient';
import BeerStyleQueryResult from './schema/BeerStyleQueryResult';

interface DeleteBeerStyleByIdArgs {
  beerStyleId: string;
}

const deleteBeerStyleById = async ({
  beerStyleId,
}: DeleteBeerStyleByIdArgs): Promise<z.infer<typeof BeerStyleQueryResult> | null> => {
  const deleted = await DBClient.instance.beerStyle.delete({
    where: { id: beerStyleId },
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

  /**
   * Prisma does not support tuples, so we have to typecast the ibuRange and abvRange
   * fields to [number, number] in order to satisfy the zod schema.
   */
  return deleted as Awaited<ReturnType<typeof deleteBeerStyleById>>;
};

export default deleteBeerStyleById;
