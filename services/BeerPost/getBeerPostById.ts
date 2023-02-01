import DBClient from '@/prisma/DBClient';
import BeerPostQueryResult from './schema/BeerPostQueryResult';

const prisma = DBClient.instance;

const getBeerPostById = async (id: string) => {
  const beerPost: BeerPostQueryResult | null = await prisma.beerPost.findFirst({
    select: {
      beerComments: {
        select: {
          id: true,
          content: true,
          createdAt: true,
          postedBy: {
            select: {
              username: true,
              id: true,
            },
          },
          rating: true,
        },
      },
      id: true,
      name: true,
      brewery: {
        select: {
          name: true,
          id: true,
        },
      },
      ibu: true,
      abv: true,
      type: {
        select: {
          name: true,
          id: true,
        },
      },
      beerImages: {
        select: {
          alt: true,
          url: true,
          id: true,
        },
      },
      createdAt: true,
      description: true,
      postedBy: {
        select: {
          username: true,
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
