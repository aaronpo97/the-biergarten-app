import DBClient from '@/prisma/DBClient';
import BreweryPostQueryResult from '@/services/BreweryPost/schema/BreweryPostQueryResult';
import { z } from 'zod';

const prisma = DBClient.instance;

const getBreweryPostById = async (id: string) => {
  const breweryPost: z.infer<typeof BreweryPostQueryResult> | null =
    (await prisma.breweryPost.findFirst({
      select: {
        id: true,
        location: {
          select: {
            city: true,
            address: true,
            coordinates: true,
            country: true,
            stateOrProvince: true,
          },
        },
        description: true,
        name: true,
        breweryImages: { select: { path: true, caption: true, id: true, alt: true } },
        postedBy: { select: { username: true, id: true } },
        createdAt: true,
        dateEstablished: true,
      },
      where: { id },
    })) as z.infer<typeof BreweryPostQueryResult> | null;

  return breweryPost;
};

export default getBreweryPostById;
