import { NextApiRequest } from 'next';

import { GetAllPostsRequest } from '@/controllers/posts/types';
import { UserExtendedNextApiRequest } from '@/config/auth/types';
import { z } from 'zod';
import CreateBeerStyleValidationSchema from '@/services/BeerStyles/schema/CreateBeerStyleValidationSchema';

export interface GetBeerStyleByIdRequest extends NextApiRequest {
  query: { id: string };
}

export interface GetAllBeersByBeerStyleRequest extends GetAllPostsRequest {
  query: { page_size: string; page_num: string; id: string };
}
export interface CreateBeerStyleRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof CreateBeerStyleValidationSchema>;
}
