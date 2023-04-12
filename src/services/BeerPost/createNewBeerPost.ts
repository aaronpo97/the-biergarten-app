import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import beerPostQueryResult from './schema/BeerPostQueryResult';
import CreateBeerPostValidationSchema from './schema/CreateBeerPostValidationSchema';

const CreateBeerPostWithUserSchema = CreateBeerPostValidationSchema.extend({
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
  const newBeerPost: z.infer<typeof beerPostQueryResult> =
    await DBClient.instance.beerPost.create({
      data: {
        name,
        description,
        abv,
        ibu,
        type: { connect: { id: typeId } },
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
        beerImages: { select: { id: true, path: true, caption: true, alt: true } },
        brewery: { select: { id: true, name: true } },
        type: { select: { id: true, name: true } },
        postedBy: { select: { id: true, username: true } },
      },
    });
  return newBeerPost;
};

export default createNewBeerPost;
