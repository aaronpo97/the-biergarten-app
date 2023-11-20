import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import EditBeerPostValidationSchema from './schema/EditBeerPostValidationSchema';
import BeerPostQueryResult from './schema/BeerPostQueryResult';

const schema = EditBeerPostValidationSchema.omit({ id: true, styleId: true });

interface EditBeerPostByIdArgs {
  id: string;
  data: z.infer<typeof schema>;
}

const editBeerPostById = ({
  id,
  data: { abv, ibu, name, description },
}: EditBeerPostByIdArgs): Promise<z.infer<typeof BeerPostQueryResult>> => {
  return DBClient.instance.beerPost.update({
    where: { id },
    data: { abv, ibu, name, description },
    select: {
      id: true,
      name: true,
      description: true,
      abv: true,
      ibu: true,
      createdAt: true,
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
      brewery: { select: { id: true, name: true } },
      style: { select: { id: true, name: true, description: true } },
      postedBy: { select: { id: true, username: true } },
    },
  });
};

export default editBeerPostById;
