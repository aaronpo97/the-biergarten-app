import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

export type SendEditBeerPostCommentRequest = (args: {
  body: { content: string; rating: number };
  commentId: string;
}) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type SendDeleteBeerPostCommentRequest = (args: {
  commentId: string;
}) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type SendCreateBeerCommentRequest = (args: {
  beerPostId: string;
  body: { content: string; rating: number };
}) => Promise<z.infer<typeof CommentQueryResult>>;
