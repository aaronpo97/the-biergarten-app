import DBClient from '@/prisma/DBClient';
import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import { z } from 'zod';

const prisma = DBClient.instance;

const getBreweryPostById = async (id: string) => {
  const breweryPost = await prisma.breweryPost.findFirst({
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
      breweryImages: {
        select: {
          path: true,
          caption: true,
          id: true,
          alt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      postedBy: { select: { username: true, id: true } },
      createdAt: true,
      dateEstablished: true,
    },
    where: { id },
  });

  /**
   * Prisma does not support tuples, so we have to typecast the coordinates field to
   * [number, number] in order to satisfy the zod schema.
   */
  return breweryPost as z.infer<typeof BreweryPostQueryResult> | null;
};

export default getBreweryPostById;
