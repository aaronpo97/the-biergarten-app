import DBClient from '@/prisma/DBClient';

const findBeerPostLikeById = async (id: string) =>
  DBClient.instance.beerPostLike.findUnique({ where: { id } });

export default findBeerPostLikeById;
