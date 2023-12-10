import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getBeerPostRecommendations } from '@/controllers/posts/beer-posts';
import { GetBeerRecommendationsRequest } from '@/controllers/posts/beer-posts/types';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  GetBeerRecommendationsRequest,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: z.object({
      id: z.string().cuid(),
      page_num: z.string().regex(/^[0-9]+$/),
      page_size: z.string().regex(/^[0-9]+$/),
    }),
  }),
  getBeerPostRecommendations,
);

const handler = router.handler(NextConnectOptions);

export default handler;
