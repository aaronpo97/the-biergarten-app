import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerPostQueryResult from './schema/BeerPostQueryResult';

interface GetBeerPostsByBeerStyleIdArgs {
  styleId: string;
  pageSize: number;
  pageNum: number;
}

const getBeerPostsByBeerStyleId = async ({
  pageNum,
  pageSize,
  styleId,
}: GetBeerPostsByBeerStyleIdArgs): Promise<z.infer<typeof BeerPostQueryResult>[]> => {
  const beers = await DBClient.instance.beerPost.findMany({
    where: { styleId },
    take: pageSize,
    skip: pageNum * pageSize,
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

export default getBeerPostsByBeerStyleId;
