import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CommentQueryResult from '../../schema/CommentSchema/CommentQueryResult';

interface GetAllBeerStyleCommentArgs {
  beerStyleId: string;
  pageNum: number;
  pageSize: number;
}

const getAllBeerStyleComments = async ({
  beerStyleId,
  pageNum,
  pageSize,
}: GetAllBeerStyleCommentArgs): Promise<z.infer<typeof CommentQueryResult>[]> => {
  return DBClient.instance.beerStyleComment.findMany({
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
    where: { beerStyleId },
    orderBy: { createdAt: 'desc' },
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
  });
};

export default getAllBeerStyleComments;
