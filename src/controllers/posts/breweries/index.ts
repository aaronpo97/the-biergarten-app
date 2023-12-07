import DBClient from '@/prisma/DBClient';
import getAllBreweryPostsByPostedById from '@/services/BreweryPost/getAllBreweryPostsByPostedById';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { z } from 'zod';
import { GetPostsByUserIdRequest } from '../types';

// eslint-disable-next-line import/prefer-default-export
export const getBreweryPostsByUserId = async (
  req: GetPostsByUserIdRequest,
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
