import DBClient from '@/prisma/DBClient';
import BeerPostQueryResult from '@/services/posts/beer-post/schema/BeerPostQueryResult';

import { z } from 'zod';

interface GetBeerRecommendationsArgs {
  beerPost: z.infer<typeof BeerPostQueryResult>;
  pageNum: number;
  pageSize: number;
}

const getBeerRecommendations = async ({
  beerPost,
  pageNum,
  pageSize,
}: GetBeerRecommendationsArgs): Promise<{
  beerRecommendations: z.infer<typeof BeerPostQueryResult>[];
  count: number;
}> => {
  const skip = (pageNum - 1) * pageSize;
  const take = pageSize;

  const beerRecommendations: z.infer<typeof BeerPostQueryResult>[] =
    await DBClient.instance.beerPost.findMany({
      where: {
        OR: [{ styleId: beerPost.style.id }, { breweryId: beerPost.brewery.id }],
        NOT: { id: beerPost.id },
      },
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
      take,
      skip,
    });

  const count = await DBClient.instance.beerPost.count({
    where: {
      OR: [{ styleId: beerPost.style.id }, { breweryId: beerPost.brewery.id }],
      NOT: { id: beerPost.id },
    },
  });

  return { beerRecommendations, count };
};

export default getBeerRecommendations;
