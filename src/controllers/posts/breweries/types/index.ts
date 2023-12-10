import { UserExtendedNextApiRequest } from '@/config/auth/types';
import CreateBreweryPostSchema from '@/services/posts/brewery-post/schema/CreateBreweryPostSchema';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';
import { NextApiRequest } from 'next';
import { z } from 'zod';

export interface GetBreweryPostsRequest extends NextApiRequest {
  query: z.infer<typeof PaginatedQueryResponseSchema>;
}

export interface CreateBreweryPostRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof CreateBreweryPostSchema>;
}
