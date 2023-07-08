import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CreateCommentValidationSchema from '../schema/CommentSchema/CreateCommentValidationSchema';

const CreateNewBeerCommentServiceSchema = CreateCommentValidationSchema.extend({
  userId: z.string().cuid(),
  beerPostId: z.string().cuid(),
});

const createNewBeerComment = async ({
  content,
  rating,
  beerPostId,
  userId,
}: z.infer<typeof CreateNewBeerCommentServiceSchema>) => {
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
    },
  });
};

export default createNewBeerComment;
