import DBClient from '@/prisma/DBClient';
import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';

const getBeerRecommendations = async (
  beerPost: Pick<z.infer<typeof beerPostQueryResult>, 'type' | 'brewery' | 'id'>,
) => {
  const beerRecommendations = await DBClient.instance.beerPost.findMany({
    where: {
      OR: [{ typeId: beerPost.type.id }, { breweryId: beerPost.brewery.id }],
      NOT: { id: beerPost.id },
    },
    include: {
      beerImages: { select: { id: true, path: true, caption: true, alt: true } },
      brewery: { select: { id: true, name: true } },
    },
  });

  return beerRecommendations;
};

export default getBeerRecommendations;
