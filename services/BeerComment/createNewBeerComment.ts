import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerCommentValidationSchema from './schema/CreateBeerCommentValidationSchema';

const createNewBeerComment = async ({
  content,
  rating,
  beerPostId,
}: z.infer<typeof BeerCommentValidationSchema>) => {
  const user = await DBClient.instance.user.findFirstOrThrow();
  return DBClient.instance.beerComment.create({
    data: {
      content,
      rating,
      beerPost: { connect: { id: beerPostId } },
      postedBy: { connect: { id: user.id } },
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
