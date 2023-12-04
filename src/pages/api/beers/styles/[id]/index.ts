import validateRequest from '@/config/nextConnect/middleware/validateRequest';
import { getBeerStyle } from '@/controllers/posts/beerStyles';
import { GetBeerStyleByIdRequest } from '@/controllers/posts/beerStyles/types';

import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { NextApiResponse } from 'next';
import { createRouter } from 'next-connect';
import { z } from 'zod';

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
