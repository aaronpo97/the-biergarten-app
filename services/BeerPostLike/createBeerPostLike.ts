import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import GetUserSchema from '../User/schema/GetUserSchema';

const createBeerPostLike = async ({
  id,
  user,
}: {
  id: string;
  user: z.infer<typeof GetUserSchema>;
}) => {
  return DBClient.instance.beerPostLike.create({
    data: {
      beerPost: { connect: { id } },
      likedBy: { connect: { id: user.id } },
    },
  });
};

export default createBeerPostLike;
