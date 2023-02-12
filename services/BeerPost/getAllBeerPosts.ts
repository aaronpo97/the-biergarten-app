import DBClient from '@/prisma/DBClient';
import BeerPostQueryResult from './schema/BeerPostQueryResult';

const prisma = DBClient.instance;

const getAllBeerPosts = async (pageNum: number, pageSize: number) => {
  const skip = (pageNum - 1) * pageSize;

  const beerPosts: BeerPostQueryResult[] = await prisma.beerPost.findMany({
    select: {
      id: true,
      name: true,
      type: {
        select: {
          name: true,
          id: true,
        },
      },
      ibu: true,
      abv: true,
      brewery: {
        select: {
          name: true,
          id: true,
        },
      },
      description: true,
      createdAt: true,
      postedBy: {
        select: {
          id: true,
          username: true,
        },
      },
      beerImages: {
        select: {
          path: true,
          caption: true,
          id: true,
          alt: true,
        },
      },
    },
    take: pageSize,
    skip,
  });

  return beerPosts;
};

export default getAllBeerPosts;
