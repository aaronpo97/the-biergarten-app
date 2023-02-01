import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import BeerPostValidationSchema from './schema/CreateBeerPostValidationSchema';

const createNewBeerPost = async ({
  name,
  description,
  abv,
  ibu,
  typeId,
  breweryId,
}: z.infer<typeof BeerPostValidationSchema>) => {
  const user = await DBClient.instance.user.findFirstOrThrow();

  const newBeerPost = await DBClient.instance.beerPost.create({
    data: {
      name,
      description,
      abv,
      ibu,
      type: { connect: { id: typeId } },
      postedBy: { connect: { id: user.id } },
      brewery: { connect: { id: breweryId } },
    },
  });
  return newBeerPost;
};

export default createNewBeerPost;
