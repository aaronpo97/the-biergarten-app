import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerPostQueryResult from './schema/BeerPostQueryResult';

const deleteBeerPostById = async (
  id: string,
): Promise<z.infer<typeof BeerPostQueryResult> | null> => {
  const deleted = await DBClient.instance.beerPost.delete({
    where: { id },
    select: {
      id: true,
      name: true,
      brewery: { select: { id: true, name: true } },
      description: true,
      beerImages: { select: { id: true, path: true, caption: true, alt: true } },
      ibu: true,
      abv: true,
      style: { select: { id: true, name: true, description: true } },
      postedBy: { select: { id: true, username: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  return deleted;
};

export default deleteBeerPostById;
