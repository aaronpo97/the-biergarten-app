import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerPostQueryResult from './schema/BeerPostQueryResult';
import CreateBeerPostValidationSchema from './schema/CreateBeerPostValidationSchema';

const CreateBeerPostWithUserSchema = CreateBeerPostValidationSchema.extend({
  userId: z.string().cuid(),
});

const createNewBeerPost = ({
  name,
  description,
  abv,
  ibu,
  styleId,
  breweryId,
  userId,
}: z.infer<typeof CreateBeerPostWithUserSchema>): Promise<
  z.infer<typeof BeerPostQueryResult>
> => {
  return DBClient.instance.beerPost.create({
    data: {
      name,
      description,
      abv,
      ibu,
      style: { connect: { id: styleId } },
      postedBy: { connect: { id: userId } },
      brewery: { connect: { id: breweryId } },
    },
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

export default createNewBeerPost;
