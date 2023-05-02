import DBClient from '@/prisma/DBClient';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';

import { z } from 'zod';

const prisma = DBClient.instance;

const getAllBreweryPosts = async (pageNum?: number, pageSize?: number) => {
  const skip = pageNum && pageSize ? (pageNum - 1) * pageSize : undefined;
  const take = pageNum && pageSize ? pageSize : undefined;

  const breweryPosts: z.infer<typeof BreweryPostQueryResult>[] =
    await prisma.breweryPost.findMany({
      skip,
      take,
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
        breweryImages: { select: { path: true, caption: true, id: true, alt: true } },
        createdAt: true,
        dateEstablished: true,
      },
      orderBy: { createdAt: 'desc' },
    });

  return breweryPosts;
};

export default getAllBreweryPosts;
