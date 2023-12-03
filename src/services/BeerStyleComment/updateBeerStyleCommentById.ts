import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CreateCommentValidationSchema from '../schema/CommentSchema/CreateCommentValidationSchema';

interface UpdateBeerStyleCommentByIdParams {
  body: z.infer<typeof CreateCommentValidationSchema>;
  id: string;
}

const updateBeerStyleCommentById = ({ body, id }: UpdateBeerStyleCommentByIdParams) => {
  const { content, rating } = body;

  return DBClient.instance.beerStyleComment.update({
    where: { id },
    data: {
      content,
      rating,
      updatedAt: new Date(),
    },
  });
};

export default updateBeerStyleCommentById;
