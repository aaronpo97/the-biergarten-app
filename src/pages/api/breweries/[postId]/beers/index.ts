import NextConnectOptions from '@/config/nextConnect/NextConnectOptions';
import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getAllBeersByBrewery } from '@/controllers/posts/breweries';
import { GetAllPostsByConnectedPostId } from '@/controllers/posts/types';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

const router = createRouter<
  GetAllPostsByConnectedPostId,
  NextApiResponse<z.infer<typeof APIResponseValidationSchema>>
>();

router.get(
  validateRequest({
    querySchema: PaginatedQueryResponseSchema.extend({ postId: z.string().cuid() }),
  }),
  getAllBeersByBrewery,
);

const handler = router.handler(NextConnectOptions);

export default handler;
