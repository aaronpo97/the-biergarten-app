import DBClient from '@/prisma/DBClient';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { z } from 'zod';

const prisma = DBClient.instance;

const getAllBreweryPosts = async () => {
  const breweryPosts: z.infer<typeof BreweryPostQueryResult>[] =
    await prisma.breweryPost.findMany({
      select: {
        id: true,
        location: true,
        name: true,
        postedBy: { select: { username: true, id: true } },
        breweryImages: { select: { path: true, caption: true, id: true, alt: true } },
      },
    });

  return breweryPosts;
};

export default getAllBreweryPosts;
