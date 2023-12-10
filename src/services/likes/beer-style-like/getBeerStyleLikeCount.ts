import DBClient from '@/prisma/DBClient';

interface GetBeerStyleLikeCountArgs {
  beerStyleId: string;
}
const getBeerStyleLikeCount = async ({ beerStyleId }: GetBeerStyleLikeCountArgs) => {
  return DBClient.instance.beerStyleLike.count({ where: { beerStyleId } });
};

export default getBeerStyleLikeCount;
