import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import getAllBeerPosts from '@/services/BeerPost/getAllBeerPosts';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetBeerPostsRequest extends NextApiRequest {
  query: z.infer<typeof PaginatedQueryResponseSchema>;
}

const getBeerPosts = async (
  req: GetBeerPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const beerPosts = await getAllBeerPosts({ pageNum, pageSize });
  const beerPostCount = await DBClient.instance.beerPost.count();

  res.setHeader('X-Total-Count', beerPostCount);

  res.status(200).json({
    message: 'Beer posts retrieved successfully',
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
    querySchema: PaginatedQueryResponseSchema,
  }),
  getBeerPosts,
);

const handler = router.handler();

export default handler;
