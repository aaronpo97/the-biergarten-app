import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CommentQueryResult from '../schema/CommentSchema/CommentQueryResult';

const getAllBreweryComments = async ({
  id,
  pageNum,
  pageSize,
}: {
  id: string;
  pageNum: number;
  pageSize: number;
}) => {
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
        updatedAt: true,
        postedBy: {
          select: { id: true, username: true, createdAt: true, userAvatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  return breweryComments;
};

export default getAllBreweryComments;
