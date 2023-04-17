import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import getAllBeerPosts from '@/services/BeerPost/getAllBeerPosts';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetBeerPostsRequest extends NextApiRequest {
  query: {
    pageNum: string;
    pageSize: string;
  };
}

const getBeerPosts = async (
  req: GetBeerPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.pageNum, 10);
  const pageSize = parseInt(req.query.pageSize, 10);

  const beerPosts = await getAllBeerPosts(pageNum, pageSize);

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
    querySchema: z.object({
      pageNum: z.string().regex(/^\d+$/),
      pageSize: z.string().regex(/^\d+$/),
    }),
  }),
  getBeerPosts,
);

const handler = router.handler();

export default handler;
