import DBClient from '@/prisma/DBClient';
import { BeerPostQueryResult } from '@/services/BeerPost/schema/BeerPostQueryResult';
import { BeerCommentQueryResultArrayT } from './schema/BeerCommentQueryResult';

const getAllBeerComments = async (
  { id }: Pick<BeerPostQueryResult, 'id'>,
  { pageSize, pageNum = 0 }: { pageSize: number; pageNum?: number },
) => {
  const skip = (pageNum - 1) * pageSize;
  const beerComments: BeerCommentQueryResultArrayT =
    await DBClient.instance.beerComment.findMany({
      skip,
      take: pageSize,
      where: { beerPostId: id },
      select: {
        id: true,
        content: true,
        rating: true,
        createdAt: true,
        postedBy: { select: { id: true, username: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  return beerComments;
};

export default getAllBeerComments;
