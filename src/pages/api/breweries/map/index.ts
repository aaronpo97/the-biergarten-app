import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import BreweryPostMapQueryResult from '@/services/BreweryPost/schema/BreweryPostMapQueryResult';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetBreweryPostsRequest extends NextApiRequest {
  query: {
    page_num: string;
    page_size: string;
  };
}

const getBreweryPosts = async (
  req: GetBreweryPostsRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const skip = (pageNum - 1) * pageSize;
  const take = pageSize;

  const breweryPosts: z.infer<typeof BreweryPostMapQueryResult>[] =
    await DBClient.instance.breweryPost.findMany({
      select: {
        location: {
          select: {
            coordinates: true,
            city: true,
            country: true,
            stateOrProvince: true,
          },
        },
        id: true,
        name: true,
      },
      skip,
      take,
    });
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
      page_num: z.string().regex(/^\d+$/),
      page_size: z.string().regex(/^\d+$/),
    }),
  }),
  getBreweryPosts,
);

const handler = router.handler();

export default handler;
