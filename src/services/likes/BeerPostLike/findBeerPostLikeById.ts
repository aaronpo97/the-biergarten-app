import DBClient from '@/prisma/DBClient';

interface FindBeerPostLikeByIdArgs {
  beerPostId: string;
  likedById: string;
}

const findBeerPostLikeById = async ({
  beerPostId,
  likedById,
}: FindBeerPostLikeByIdArgs) =>
  DBClient.instance.beerPostLike.findFirst({ where: { beerPostId, likedById } });

export default findBeerPostLikeById;
