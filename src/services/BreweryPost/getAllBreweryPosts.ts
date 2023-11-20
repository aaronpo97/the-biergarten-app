import DBClient from '@/prisma/DBClient';
import BreweryPostQueryResult from '@/services/BreweryPost/schema/BreweryPostQueryResult';

import { z } from 'zod';

const prisma = DBClient.instance;

const getAllBreweryPosts = async ({
  pageNum,
  pageSize,
}: {
  pageNum: number;
  pageSize: number;
}): Promise<z.infer<typeof BreweryPostQueryResult>[]> => {
  const breweryPosts = await prisma.breweryPost.findMany({
    take: pageSize,
    skip: (pageNum - 1) * pageSize,
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
      postedBy: { select: { username: true, id: true } },
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
      createdAt: true,
      dateEstablished: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  /**
   * Prisma does not support tuples, so we have to typecast the coordinates field to
   * [number, number] in order to satisfy the zod schema.
   */
  return breweryPosts as Awaited<ReturnType<typeof getAllBreweryPosts>>;
};

export default getAllBreweryPosts;
