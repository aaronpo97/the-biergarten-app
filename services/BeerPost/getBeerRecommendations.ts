import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import DBClient from '@/prisma/DBClient';

const getBeerRecommendations = async (
  beerPost: Pick<BeerPostQueryResult, 'type' | 'brewery'>,
) => {
  const beerRecommendations = await DBClient.instance.beerPost.findMany({
    where: {
      OR: [
        {
          typeId: beerPost.type.id,
        },
        {
          breweryId: beerPost.brewery.id,
        },
      ],
    },
    include: {
      beerImages: {
        select: { id: true, url: true, alt: true },
      },
      brewery: {
        select: { id: true, name: true },
      },
    },
  });

  return beerRecommendations;
};

export default getBeerRecommendations;
