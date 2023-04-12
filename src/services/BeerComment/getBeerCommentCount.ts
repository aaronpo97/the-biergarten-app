import DBClient from '@/prisma/DBClient';

const getBeerCommentCount = async (beerPostId: string) => {
  const count = await DBClient.instance.beerComment.count({
    where: { beerPostId },
  });

  return count;
};

export default getBeerCommentCount;
