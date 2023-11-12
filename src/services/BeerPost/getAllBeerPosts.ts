import DBClient from '@/prisma/DBClient';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';

const prisma = DBClient.instance;

interface GetAllBeerPostsArgs {
  pageNum: number;
  pageSize: number;
}

const getAllBeerPosts = ({
  pageNum,
  pageSize,
}: GetAllBeerPostsArgs): Promise<z.infer<typeof BeerPostQueryResult>[]> => {
  return prisma.beerPost.findMany({
    select: {
      id: true,
      name: true,
      ibu: true,
      abv: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      style: { select: { name: true, id: true, description: true } },
      brewery: { select: { name: true, id: true } },
      postedBy: { select: { id: true, username: true } },
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
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
    orderBy: { createdAt: 'desc' },
  });
};

export default getAllBeerPosts;
