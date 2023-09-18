import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import DBClient from '@/prisma/DBClient';
import getAllBeerTypes from '@/services/BeerTypes/getAllBeerTypes';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetBeerTypesRequest extends NextApiRequest {
  query: { page_num: string; page_size: string };
}

const getBeerTypes = async (
  req: GetBeerTypesRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const pageNum = parseInt(req.query.page_num, 10);
  const pageSize = parseInt(req.query.page_size, 10);

  const beerTypes = await getAllBeerTypes(pageNum, pageSize);
  const beerTypeCount = await DBClient.instance.beerType.count();

  res.setHeader('X-Total-Count', beerTypeCount);

  res.status(200).json({
    message: 'Beer types retrieved successfully',
    statusCode: 200,
    payload: beerTypes,
    success: true,
  });
};

const router = createRouter<
  GetBeerTypesRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: z.object({
      page_num: z.string().regex(/^\d+$/),
      page_size: z.string().regex(/^\d+$/),
    }),
  }),
  getBeerTypes,
);

const handler = router.handler();

export default handler;
