import DBClient from '@/prisma/DBClient';

const findBeerPostLikeById = async (beerPostId: string, userId: string) =>
  DBClient.instance.beerPostLike.findFirst({
    where: {
      beerPostId,
      userId,
    },
  });

export default findBeerPostLikeById;
