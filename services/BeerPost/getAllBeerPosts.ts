import DBClient from '@/prisma/client';
import BeerPostQueryResult from './types/BeerPostQueryResult';

const prisma = DBClient.instance;

const getAllBeerPosts = async (pageNum: number, pageSize: number) => {
  const skip = (pageNum - 1) * pageSize;

  const beerPosts: BeerPostQueryResult[] = await prisma.beerPost.findMany({
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
    take: pageSize,
    skip,
  });

  return beerPosts;
};

export default getAllBeerPosts;
