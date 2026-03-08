import { UserExtendedNextApiRequest } from '@/config/auth/types';
import CreateBreweryPostSchema from '@/services/posts/brewery-post/schema/CreateBreweryPostSchema';
import EditBreweryPostValidationSchema from '@/services/posts/brewery-post/schema/EditBreweryPostValidationSchema';
import PaginatedQueryResponseSchema from '@/services/schema/PaginatedQueryResponseSchema';
import { NextApiRequest } from 'next';
import { z } from 'zod';

export interface GetBreweryPostsRequest extends NextApiRequest {
  query: z.infer<typeof PaginatedQueryResponseSchema>;
}

export interface CreateBreweryPostRequest extends UserExtendedNextApiRequest {
  body: z.infer<typeof CreateBreweryPostSchema>;
}

export interface BreweryPostRequest extends UserExtendedNextApiRequest {
  query: { postId: string };
}

export interface EditBreweryPostRequest extends BreweryPostRequest {
  body: z.infer<typeof EditBreweryPostValidationSchema>;
}
