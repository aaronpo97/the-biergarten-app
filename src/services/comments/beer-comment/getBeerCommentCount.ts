import DBClient from '@/prisma/DBClient';

interface GetBeerCommentCountArgs {
  beerPostId: string;
}

const getBeerCommentCount = async ({
  beerPostId,
}: GetBeerCommentCountArgs): Promise<number> => {
  return DBClient.instance.beerComment.count({ where: { beerPostId } });
};

export default getBeerCommentCount;
