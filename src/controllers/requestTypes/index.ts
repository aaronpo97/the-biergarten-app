import { UserExtendedNextApiRequest } from '@/config/auth/types';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import { z } from 'zod';

export interface CommentRequest extends UserExtendedNextApiRequest {
  query: { id: string };
}

export interface EditCommentRequest extends CommentRequest {
  body: z.infer<typeof CreateCommentValidationSchema>;
}
