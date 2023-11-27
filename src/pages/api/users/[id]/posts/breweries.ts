import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import getAllBreweryPostsByPostedById from '@/services/BreweryPost/getAllBreweryPostsByPostedById';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

interface GetBreweryPostsRequest extends NextApiRequest {
  query: {
    page_num: string;
    page_size: string;
    id: string;
  };
}

const getBreweryPostsByUserId = async (
  req: GetBreweryPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const { id } = req.query;

  const breweryPosts = await getAllBreweryPostsByPostedById({
    pageNum,
    pageSize,
    postedById: id,
  });

  const breweryPostCount = await DBClient.instance.breweryPost.count({
    where: { postedBy: { id } },
  });

  res.setHeader('X-Total-Count', breweryPostCount);

  res.status(200).json({
    message: `Brewery posts by user ${id} fetched successfully`,
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
    querySchema: PaginatedQueryResponseSchema.extend({ id: z.string().cuid() }),
  }),
  getBreweryPostsByUserId,
);

const handler = router.handler();

export default handler;
