import DBClient from '@/prisma/DBClient';

const getBeerPostLikeCount = async (beerPostId: string) => {
  const count = await DBClient.instance.beerPostLike.count({
    where: { beerPostId },
  });

  return count;
};

export default getBeerPostLikeCount;
