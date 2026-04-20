import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';
import { z } from 'zod';

type BeerStyleComment = z.infer<typeof CommentQueryResult>;

export type FindOrDeleteBeerStyleCommentById = (args: {
  beerStyleCommentId: string;
}) => Promise<BeerStyleComment | null>;

export type UpdateBeerStyleCommentById = (args: {
  body: z.infer<typeof CreateCommentValidationSchema>;
  beerStyleCommentId: string;
}) => Promise<BeerStyleComment>;

export type GetAllBeerStyleComments = (args: {
  beerStyleId: string;
  pageNum: number;
  pageSize: number;
}) => Promise<{
  comments: BeerStyleComment[];
  count: number;
}>;

export type CreateNewBeerStyleComment = (args: {
  body: z.infer<typeof CreateCommentValidationSchema>;
  userId: string;
  beerStyleId: string;
}) => Promise<BeerStyleComment>;
