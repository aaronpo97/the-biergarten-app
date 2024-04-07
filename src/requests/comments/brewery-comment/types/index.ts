import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

export type SendEditBreweryPostCommentRequest = (args: {
  body: { content: string; rating: number };
  commentId: string;
  breweryPostId: string;
}) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type SendDeleteBreweryPostCommentRequest = (args: {
  commentId: string;
  breweryPostId: string;
}) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type SendCreateBreweryPostCommentRequest = (args: {
  breweryPostId: string;
  body: { content: string; rating: number };
}) => Promise<z.infer<typeof CommentQueryResult>>;
