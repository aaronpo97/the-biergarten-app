import DBClient from '@/prisma/DBClient';
import BeerPostQueryResult from './types/BeerPostQueryResult';

const prisma = DBClient.instance;

const getBeerPostById = async (id: string) => {
  const beerPost: BeerPostQueryResult | null = await prisma.beerPost.findFirst({
    select: {
      id: true,
      name: true,
      brewery: {
        select: {
          name: true,
          id: true,
        },
      },
      description: true,
      postedBy: {
        select: {
          firstName: true,
          lastName: true,
          id: true,
        },
      },
    },
    where: {
      id,
    },
  });

  return beerPost;
};

export default getBeerPostById;
