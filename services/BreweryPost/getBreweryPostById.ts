import DBClient from '@/prisma/DBClient';
import GetAllBreweryPostsQueryResult from './types/BreweryPostQueryResult';

const prisma = DBClient.instance;

const getBreweryPostById = async (id: string) => {
  const breweryPost: GetAllBreweryPostsQueryResult | null =
    await prisma.breweryPost.findFirst({
      select: {
        id: true,
        location: true,
        name: true,
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

  return breweryPost;
};

export default getBreweryPostById;
