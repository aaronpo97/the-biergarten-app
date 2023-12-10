import DBClient from '@/prisma/DBClient';
import BeerPostQueryResult from '@/services/posts/beer-post/schema/BeerPostQueryResult';
import { z } from 'zod';

const prisma = DBClient.instance;

const getBeerPostById = async (
  id: string,
): Promise<z.infer<typeof BeerPostQueryResult> | null> => {
  return prisma.beerPost.findFirst({
    select: {
      id: true,
      name: true,
      ibu: true,
      abv: true,
      createdAt: true,
      updatedAt: true,
      description: true,
      postedBy: { select: { username: true, id: true } },
      brewery: { select: { name: true, id: true } },
      style: { select: { name: true, id: true, description: true } },
      beerImages: {
        select: {
          alt: true,
          path: true,
          caption: true,
          id: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
    where: { id },
  });
};

export default getBeerPostById;
