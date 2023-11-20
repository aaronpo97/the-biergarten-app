import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CreateCommentValidationSchema from '../schema/CommentSchema/CreateCommentValidationSchema';
import CommentQueryResult from '../schema/CommentSchema/CommentQueryResult';

const CreateNewBreweryCommentServiceSchema = CreateCommentValidationSchema.extend({
  userId: z.string().cuid(),
  breweryPostId: z.string().cuid(),
});

const createNewBreweryComment = async ({
  content,
  rating,
  breweryPostId,
  userId,
}: z.infer<typeof CreateNewBreweryCommentServiceSchema>): Promise<
  z.infer<typeof CommentQueryResult>
> => {
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
      createdAt: true,
      updatedAt: true,
      postedBy: {
        select: { id: true, username: true, createdAt: true, userAvatar: true },
      },
    },
  });
};

export default createNewBreweryComment;
