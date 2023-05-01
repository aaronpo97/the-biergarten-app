import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CreateCommentValidationSchema from '../types/CommentSchema/CreateCommentValidationSchema';

const CreateNewBreweryCommentServiceSchema = CreateCommentValidationSchema.extend({
  userId: z.string().uuid(),
  breweryPostId: z.string().uuid(),
});

const createNewBreweryComment = async ({
  content,
  rating,
  breweryPostId,
  userId,
}: z.infer<typeof CreateNewBreweryCommentServiceSchema>) => {
  return DBClient.instance.breweryComment.create({
    data: {
      content,
      rating,
      breweryPost: { connect: { id: breweryPostId } },
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

export default createNewBreweryComment;
