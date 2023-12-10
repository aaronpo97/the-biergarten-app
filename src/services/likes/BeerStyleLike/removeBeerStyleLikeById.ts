import DBClient from '@/prisma/DBClient';

interface RemoveBeerStyleLikeByIdArgs {
  beerStyleLikeId: string;
}
const removeBeerStyleLikeById = async ({
  beerStyleLikeId,
}: RemoveBeerStyleLikeByIdArgs) => {
  return DBClient.instance.beerStyleLike.delete({ where: { id: beerStyleLikeId } });
};

export default removeBeerStyleLikeById;
