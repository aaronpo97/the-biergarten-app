import DBClient from '@/prisma/DBClient';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';

const prisma = DBClient.instance;

const getBeerPostById = async (id: string) => {
  const beerPost: z.infer<typeof BeerPostQueryResult> | null =
    await prisma.beerPost.findFirst({
      select: {
        id: true,
        name: true,
        ibu: true,
        abv: true,
        createdAt: true,
        description: true,
        postedBy: { select: { username: true, id: true } },
        brewery: { select: { name: true, id: true } },
        type: { select: { name: true, id: true } },
        beerImages: { select: { alt: true, path: true, caption: true, id: true } },
      },
      where: { id },
    });

  return beerPost;
};

export default getBeerPostById;
