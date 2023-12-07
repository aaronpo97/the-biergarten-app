import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerPostQueryResult from './schema/BeerPostQueryResult';

interface GetBeerPostsByBeerStyleIdArgs {
  postedById: string;
  pageSize: number;
  pageNum: number;
}

const getBeerPostsByPostedById = async ({
  pageNum,
  pageSize,
  postedById,
}: GetBeerPostsByBeerStyleIdArgs): Promise<z.infer<typeof BeerPostQueryResult>[]> => {
  const beers = await DBClient.instance.beerPost.findMany({
    where: { postedBy: { id: postedById } },
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
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
  });

  return beers;
};

export default getBeerPostsByPostedById;
