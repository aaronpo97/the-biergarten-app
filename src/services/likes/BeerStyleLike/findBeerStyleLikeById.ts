import DBClient from '@/prisma/DBClient';

interface FindBeerStyleLikeByIdArgs {
  beerStyleId: string;
  likedById: string;
}
const findBeerStyleLikeById = async ({
  beerStyleId,
  likedById,
}: FindBeerStyleLikeByIdArgs) => {
  return DBClient.instance.beerStyleLike.findFirst({
    where: { beerStyleId, likedById },
  });
};

export default findBeerStyleLikeById;
