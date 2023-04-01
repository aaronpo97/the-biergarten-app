import DBClient from '@/prisma/DBClient';
import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';

const prisma = DBClient.instance;

const getAllBeerPosts = async (pageNum: number, pageSize: number) => {
  const skip = (pageNum - 1) * pageSize;

  const beerPosts: z.infer<typeof beerPostQueryResult>[] = await prisma.beerPost.findMany(
    {
      select: {
        id: true,
        name: true,
        ibu: true,
        abv: true,
        description: true,
        createdAt: true,
        type: { select: { name: true, id: true } },
        brewery: { select: { name: true, id: true } },
        postedBy: { select: { id: true, username: true } },
        beerImages: { select: { path: true, caption: true, id: true, alt: true } },
      },
      take: pageSize,
      skip,
    },
  );

  return beerPosts;
};

export default getAllBeerPosts;
