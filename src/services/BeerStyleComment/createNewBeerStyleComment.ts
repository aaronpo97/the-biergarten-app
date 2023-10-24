import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CreateCommentValidationSchema from '../schema/CommentSchema/CreateCommentValidationSchema';
import CommentQueryResult from '../schema/CommentSchema/CommentQueryResult';

const CreateNewBeerStyleCommentServiceSchema = CreateCommentValidationSchema.extend({
  userId: z.string().cuid(),
  beerStyleId: z.string().cuid(),
});

type CreateNewBeerCommentArgs = z.infer<typeof CreateNewBeerStyleCommentServiceSchema>;

const createNewBeerStyleComment = async ({
  content,
  rating,
  userId,
  beerStyleId,
}: CreateNewBeerCommentArgs): Promise<z.infer<typeof CommentQueryResult>> => {
  return DBClient.instance.beerStyleComment.create({
    data: {
      content,
      rating,
      beerStyle: { connect: { id: beerStyleId } },
      postedBy: { connect: { id: userId } },
    },
    select: {
      id: true,
      content: true,
      rating: true,
      postedBy: { select: { id: true, username: true } },
      createdAt: true,
      updatedAt: true,
    },
  });
};

export default createNewBeerStyleComment;
