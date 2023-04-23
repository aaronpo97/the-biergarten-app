import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import getAllBreweryPosts from '@/services/BreweryPost/getAllBreweryPosts';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetBreweryPostsRequest extends NextApiRequest {
  query: {
    pageNum: string;
    pageSize: string;
  };
}

const getBreweryPosts = async (
  req: GetBreweryPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.pageNum, 10);
  const pageSize = parseInt(req.query.pageSize, 10);

  const breweryPosts = await getAllBreweryPosts(pageNum, pageSize);
  const breweryPostCount = await DBClient.instance.breweryPost.count();

  res.setHeader('X-Total-Count', breweryPostCount);

  res.status(200).json({
    message: 'Brewery posts retrieved successfully',
    statusCode: 200,
    payload: breweryPosts,
    success: true,
  });
};

const router = createRouter<
  GetBreweryPostsRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: z.object({
      pageNum: z.string().regex(/^\d+$/),
      pageSize: z.string().regex(/^\d+$/),
    }),
  }),
  getBreweryPosts,
);

const handler = router.handler();

export default handler;
