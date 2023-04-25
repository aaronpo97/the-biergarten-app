import DBClient from '@/prisma/DBClient';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { z } from 'zod';

const prisma = DBClient.instance;

const getBreweryPostById = async (id: string) => {
  const breweryPost: z.infer<typeof BreweryPostQueryResult> | null =
    await prisma.breweryPost.findFirst({
      select: {
        id: true,
        coordinates: true,
        address: true,
        city: true,
        stateOrProvince: true,
        country: true,
        description: true,
        name: true,
        breweryImages: { select: { path: true, caption: true, id: true, alt: true } },
        postedBy: { select: { username: true, id: true } },
        createdAt: true,
        dateEstablished: true,
      },
      where: { id },
    });

  return breweryPost;
};

export default getBreweryPostById;
