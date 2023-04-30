import DBClient from '@/prisma/DBClient';
import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';
import CommentQueryResult from '../types/CommentSchema/CommentQueryResult';

const getAllBreweryComments = async (
  { id }: Pick<z.infer<typeof beerPostQueryResult>, 'id'>,
  { pageSize, pageNum = 0 }: { pageSize: number; pageNum?: number },
) => {
  const skip = (pageNum - 1) * pageSize;
  const breweryComments: z.infer<typeof CommentQueryResult>[] =
    await DBClient.instance.breweryComment.findMany({
      skip,
      take: pageSize,
      where: { breweryPostId: id },
      select: {
        id: true,
        content: true,
        rating: true,
        createdAt: true,
        postedBy: { select: { id: true, username: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  return breweryComments;
};

export default getAllBreweryComments;
