import { BeerPost } from '@prisma/client';

type BeerRecommendationQueryResult = BeerPost & {
  brewery: {
    id: string;
    name: string;
  };
  beerImages: {
    id: string;
    alt: string;
    url: string;
  }[];
};

export default BeerRecommendationQueryResult;
