import DBClient from '@/prisma/DBClient';

interface RemoveBeerPostLikeArgs {
  beerLikeId: string;
}

const removeBeerPostLikeById = async ({ beerLikeId }: RemoveBeerPostLikeArgs) =>
  DBClient.instance.beerPostLike.delete({ where: { id: beerLikeId } });

export default removeBeerPostLikeById;
