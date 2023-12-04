import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getAllBeersByBeerStyle } from '@/controllers/posts/beerStyles';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiRequest, NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

interface GetAllBeersByBeerStyleRequest extends NextApiRequest {
  query: { page_size: string; page_num: string; id: string };
}

const router = createRouter<
  GetAllBeersByBeerStyleRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: z.object({
      page_size: z.string().min(1),
      page_num: z.string().min(1),
      id: z.string().min(1),
    }),
  }),
  getAllBeersByBeerStyle,
);

const handler = router.handler(NextConnectOptions);

export default handler;
