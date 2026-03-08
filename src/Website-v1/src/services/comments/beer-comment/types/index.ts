import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import { z } from 'zod';

type BeerPostComment = z.infer<typeof CommentQueryResult>;

export type CreateBeerPostComment = (args: {
  body: z.infer<typeof CreateCommentValidationSchema>;
  userId: string;
  beerPostId: string;
}) => Promise<BeerPostComment>;

export type EditBeerPostCommentById = (args: {
  body: z.infer<typeof CreateCommentValidationSchema>;
  beerPostCommentId: string;
}) => Promise<BeerPostComment>;

export type FindOrDeleteBeerPostCommentById = (args: {
  beerPostCommentId: string;
}) => Promise<BeerPostComment | null>;

export type GetAllBeerPostComments = (args: {
  beerPostId: string;
  pageNum: number;
  pageSize: number;
}) => Promise<{
  comments: BeerPostComment[];
  count: number;
}>;
