import { UserExtendedNextApiRequest } from '@/config/auth/types';
import CreateBeerPostValidationSchema from '@/services/posts/beer-post/schema/CreateBeerPostValidationSchema';
import EditBeerPostValidationSchema from '@/services/posts/beer-post/schema/EditBeerPostValidationSchema';
import { NextApiRequest } from 'next';
import { z } from 'zod';

export interface BeerPostRequest extends UserExtendedNextApiRequest {
  query: { postId: string };
}

export interface EditBeerPostRequest extends BeerPostRequest {
  body: z.infer<typeof EditBeerPostValidationSchema>;
}

export interface GetAllBeerPostsRequest extends NextApiRequest {
  query: { page_num: string; page_size: string };
}

export interface GetBeerRecommendationsRequest extends BeerPostRequest {
  query: { postId: string; page_num: string; page_size: string };
}

export interface CreateBeerPostRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof CreateBeerPostValidationSchema>;
}
