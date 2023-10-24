import { z } from 'zod';
import DBClient from '@/prisma/DBClient';
import GetUserSchema from '@/services/User/schema/GetUserSchema';

interface CreateBeerStyleLikeArgs {
  beerStyleId: string;
  user: z.infer<typeof GetUserSchema>;
}
const createBeerStyleLike = async ({ beerStyleId, user }: CreateBeerStyleLikeArgs) => {
  return DBClient.instance.beerStyleLike.create({
    data: {
      beerStyleId,
      likedById: user.id,
    },
  });
};

export default createBeerStyleLike;
