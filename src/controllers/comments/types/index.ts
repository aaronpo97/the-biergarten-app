import { UserExtendedNextApiRequest } from '@/config/auth/types';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import { z } from 'zod';

export interface CommentRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

export interface EditAndCreateCommentRequest extends CommentRequest {
  body: z.infer<typeof CreateCommentValidationSchema>;
}

export interface GetAllCommentsRequest extends UserExtendedNextApiRequest {
  query: { id: string; page_size: string; page_num: string };
}
