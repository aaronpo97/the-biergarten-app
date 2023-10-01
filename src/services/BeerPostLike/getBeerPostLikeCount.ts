import DBClient from '@/prisma/DBClient';

const getBeerPostLikeCount = async ({ beerPostId }: { beerPostId: string }) =>
  DBClient.instance.beerPostLike.count({ where: { beerPostId } });

export default getBeerPostLikeCount;
