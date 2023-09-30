import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CreateCommentValidationSchema from '../schema/CommentSchema/CreateCommentValidationSchema';
import BeerCommentQueryResult from './schema/BeerCommentQueryResult';

const CreateNewBeerCommentServiceSchema = CreateCommentValidationSchema.extend({
  userId: z.string().cuid(),
  beerPostId: z.string().cuid(),
});

type CreateNewBeerCommentArgs = z.infer<typeof CreateNewBeerCommentServiceSchema>;

const createNewBeerComment = async ({
  content,
  rating,
  beerPostId,
  userId,
}: CreateNewBeerCommentArgs): Promise<z.infer<typeof BeerCommentQueryResult>> => {
  return DBClient.instance.beerComment.create({
    data: {
      content,
      rating,
      beerPost: { connect: { id: beerPostId } },
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

export default createNewBeerComment;
