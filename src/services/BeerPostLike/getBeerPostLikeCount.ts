import DBClient from '@/prisma/DBClient';

const getBeerPostLikeCountByBeerPostId = async ({ beerPostId }: { beerPostId: string }) =>
  DBClient.instance.beerPostLike.count({ where: { beerPostId } });

export default getBeerPostLikeCountByBeerPostId;
