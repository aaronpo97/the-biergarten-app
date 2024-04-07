import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

type APIResponse = z.infer<typeof APIResponseValidationSchema>;

export type HandleEditCommentRequest = (
  id: string,
  data: z.infer<typeof CreateCommentValidationSchema>,
) => Promise<APIResponse>;

export type HandleDeleteCommentRequest = (id: string) => Promise<APIResponse>;
