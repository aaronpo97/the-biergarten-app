import { NextApiRequest } from 'next';

import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { z } from 'zod';
import CreateBeerStyleValidationSchema from '@/services/posts/BeerStyles/schema/CreateBeerStyleValidationSchema';

export interface GetBeerStyleByIdRequest extends NextApiRequest {
  query: { id: string };
}

export interface CreateBeerStyleRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof CreateBeerStyleValidationSchema>;
}
