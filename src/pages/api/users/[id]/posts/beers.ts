import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import getBeerPostsByPostedById from '@/services/BeerPost/getBeerPostsByPostedById';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

interface GetBeerPostsRequest extends NextApiRequest {
  query: {
    page_num: string;
    page_size: string;
    id: string;
  };
}

const getBeerPostsByUserId = async (
  req: GetBeerPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const { id } = req.query;

  const beerPosts = await getBeerPostsByPostedById({ pageNum, pageSize, postedById: id });

  const beerPostCount = await DBClient.instance.beerPost.count({
    where: { postedBy: { id } },
  });

  res.setHeader('X-Total-Count', beerPostCount);

  res.status(200).json({
    message: `Beer posts by user ${id} fetched successfully`,
    statusCode: 200,
    payload: beerPosts,
    success: true,
  });
};

const router = createRouter<
  GetBeerPostsRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: PaginatedQueryResponseSchema.extend({ id: z.string().cuid() }),
  }),
  getBeerPostsByUserId,
);

const handler = router.handler();

export default handler;
