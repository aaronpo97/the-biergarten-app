import DBClient from '@/prisma/DBClient';
import BreweryPostQueryResult from './types/BreweryPostQueryResult';

const prisma = DBClient.instance;

const getAllBreweryPosts = async () => {
  const breweryPosts: BreweryPostQueryResult[] = await prisma.breweryPost.findMany({
    select: {
      id: true,
      location: true,
      name: true,
      postedBy: { select: { firstName: true, lastName: true, id: true } },
    },
  });

  return breweryPosts;
};

export default getAllBreweryPosts;
