import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CommentQueryResult from '../schema/CommentSchema/CommentQueryResult';

interface FindBeerCommentArgs {
  beerCommentId: string;
}

const findBeerCommentById = async ({
  beerCommentId,
}: FindBeerCommentArgs): Promise<z.infer<typeof CommentQueryResult> | null> => {
  return DBClient.instance.beerComment.findUnique({
    where: { id: beerCommentId },
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

export default findBeerCommentById;
