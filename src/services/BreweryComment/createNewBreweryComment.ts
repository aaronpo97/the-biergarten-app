import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import CreateCommentValidationSchema from '../schema/CommentSchema/CreateCommentValidationSchema';

const CreateNewBreweryCommentServiceSchema = CreateCommentValidationSchema.extend({
  userId: z.string().cuid(),
  breweryPostId: z.string().cuid(),
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
