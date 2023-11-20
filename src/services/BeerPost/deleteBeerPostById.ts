import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerPostQueryResult from './schema/BeerPostQueryResult';

interface DeleteBeerPostByIdArgs {
  beerPostId: string;
}

const deleteBeerPostById = ({
  beerPostId,
}: DeleteBeerPostByIdArgs): Promise<z.infer<typeof BeerPostQueryResult> | null> => {
  return DBClient.instance.beerPost.delete({
    where: { id: beerPostId },
    select: {
      abv: true,
      createdAt: true,
      description: true,
      ibu: true,
      id: true,
      name: true,
      updatedAt: true,
      beerImages: {
        select: {
          alt: true,
          path: true,
          caption: true,
          id: true,
          createdAt: true,
          updatedAt: true,
        },
      },
      style: { select: { id: true, name: true, description: true } },
      postedBy: { select: { id: true, username: true } },
      brewery: { select: { id: true, name: true } },
    },
  });
};

export default deleteBeerPostById;
