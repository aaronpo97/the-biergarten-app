import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CommentQueryResult from '../schema/CommentSchema/CommentQueryResult';

interface GetAllBeerCommentsArgs {
  beerPostId: string;
  pageNum: number;
  pageSize: number;
}

const getAllBeerComments = async ({
  beerPostId,
  pageNum,
  pageSize,
}: GetAllBeerCommentsArgs): Promise<z.infer<typeof CommentQueryResult>[]> => {
  return DBClient.instance.beerComment.findMany({
    skip: (pageNum - 1) * pageSize,
    take: pageSize,
    where: { beerPostId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      content: true,
      rating: true,
      createdAt: true,
      updatedAt: true,
      postedBy: { select: { id: true, username: true, createdAt: true } },
    },
  });
};

export default getAllBeerComments;
