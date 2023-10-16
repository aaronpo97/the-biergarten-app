import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import getBeerStyleById from '@/services/BeerStyles/getBeerStyleById';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetBeerStyleByIdRequest extends NextApiRequest {
  query: { id: string };
}

const getBeerStyle = async (
  req: GetBeerStyleByIdRequest,
  res: NextApiResponse<z.infer<typeof APIResponseValidationSchema>>,
) => {
  const { id } = req.query;

  const beerStyle = await getBeerStyleById(id);

  res.status(200).json({
    message: 'Beer types retrieved successfully',
    statusCode: 200,
    payload: beerStyle,
    success: true,
  });
};

const router = createRouter<
  GetBeerStyleByIdRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({ querySchema: z.object({ id: z.string().cuid() }) }),
  getBeerStyle,
);

const handler = router.handler();

export default handler;
