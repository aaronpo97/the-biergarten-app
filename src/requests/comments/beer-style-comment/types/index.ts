import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

export type SendEditBeerStyleCommentRequest = (args: {
  body: { content: string; rating: number };
  commentId: string;
  beerStyleId: string;
}) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type SendDeleteBeerStyleCommentRequest = (args: {
  commentId: string;
  beerStyleId: string;
}) => Promise<z.infer<typeof APIResponseValidationSchema>>;

export type SendCreateBeerStyleCommentRequest = (args: {
  beerStyleId: string;
  body: { content: string; rating: number };
}) => Promise<z.infer<typeof CommentQueryResult>>;
