import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CommentQueryResult from '../schema/CommentSchema/CommentQueryResult';

interface EditBeerCommentByIdArgs {
  id: string;
  content: string;
  rating: number;
}

const editBeerCommentById = async ({
  id,
  content,
  rating,
}: EditBeerCommentByIdArgs): Promise<z.infer<typeof CommentQueryResult>> => {
  return DBClient.instance.beerComment.update({
    where: { id },
    data: { content, rating, updatedAt: new Date() },
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

export default editBeerCommentById;
