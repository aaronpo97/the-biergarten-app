import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getAllBeersByBeerStyle } from '@/controllers/posts/beer-styles';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';

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
    querySchema: PaginatedQueryResponseSchema.extend({ postId: z.string().cuid() }),
  }),
  getAllBeersByBeerStyle,
);

const handler = router.handler(NextConnectOptions);

export default handler;
