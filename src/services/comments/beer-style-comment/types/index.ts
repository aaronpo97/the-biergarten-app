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

export type GetBeerStyleCommentCount = (args: { beerStyleId: string }) => Promise<number>;

export type GetAllBeerStyleComments = (args: {
  beerStyleId: string;
  pageNum: number;
  pageSize: number;
}) => Promise<BeerStyleComment[]>;

export type CreateNewBeerStyleComment = (args: {
  body: z.infer<typeof CreateCommentValidationSchema>;
  userId: string;
  beerStyleId: string;
}) => Promise<BeerStyleComment>;
