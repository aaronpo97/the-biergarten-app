import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerCommentQueryResult from './schema/BeerCommentQueryResult';

interface FindBeerCommentArgs {
  beerCommentId: string;
}

const findBeerCommentById = async ({
  beerCommentId,
}: FindBeerCommentArgs): Promise<z.infer<typeof BeerCommentQueryResult> | null> => {
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
