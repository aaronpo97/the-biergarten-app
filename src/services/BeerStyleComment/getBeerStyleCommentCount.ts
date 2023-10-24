import DBClient from '@/prisma/DBClient';

interface GetBeerStyleCommentCountArgs {
  beerStyleId: string;
}

const getBeerCommentCount = async ({
  beerStyleId,
}: GetBeerStyleCommentCountArgs): Promise<number> => {
  return DBClient.instance.beerStyleComment.count({
    where: { beerStyleId },
  });
};

export default getBeerCommentCount;
