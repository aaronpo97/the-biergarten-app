import DBClient from '@/prisma/DBClient';
import { z } from 'zod';
import GetUserSchema from '../../users/User/schema/GetUserSchema';

interface CreateBeerPostLikeArgs {
  id: string;
  user: z.infer<typeof GetUserSchema>;
}

const createBeerPostLike = async ({ id, user }: CreateBeerPostLikeArgs) =>
  DBClient.instance.beerPostLike.create({
    data: { beerPost: { connect: { id } }, likedBy: { connect: { id: user.id } } },
  });

export default createBeerPostLike;
