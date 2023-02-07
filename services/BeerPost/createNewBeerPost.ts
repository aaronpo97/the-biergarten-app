import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerPostValidationSchema from './schema/CreateBeerPostValidationSchema';

const CreateBeerPostWithUserSchema = BeerPostValidationSchema.extend({
  userId: z.string().uuid(),
});

const createNewBeerPost = async ({
  name,
  description,
  abv,
  ibu,
  typeId,
  breweryId,
  userId,
}: z.infer<typeof CreateBeerPostWithUserSchema>) => {
  const newBeerPost = await DBClient.instance.beerPost.create({
    data: {
      name,
      description,
      abv,
      ibu,
      type: { connect: { id: typeId } },
      postedBy: { connect: { id: userId } },
      brewery: { connect: { id: breweryId } },
    },
  });
  return newBeerPost;
};

export default createNewBeerPost;
