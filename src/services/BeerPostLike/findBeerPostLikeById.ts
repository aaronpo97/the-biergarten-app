import DBClient from '@/prisma/DBClient';

const findBeerPostLikeById = async (beerPostId: string, likedById: string) =>
  DBClient.instance.beerPostLike.findFirst({ where: { beerPostId, likedById } });

export default findBeerPostLikeById;
