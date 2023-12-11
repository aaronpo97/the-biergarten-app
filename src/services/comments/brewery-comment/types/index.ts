import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';

import { z } from 'zod';

type BreweryComment = z.infer<typeof CommentQueryResult>;

export type UpdateBreweryCommentById = (args: {
  breweryCommentId: string;
  body: z.infer<typeof CreateCommentValidationSchema>;
}) => Promise<BreweryComment>;

export type CreateNewBreweryComment = (args: {
  body: z.infer<typeof CreateCommentValidationSchema>;
  breweryPostId: string;
  userId: string;
}) => Promise<BreweryComment>;

export type GetAllBreweryComments = (args: {
  id: string;
  pageNum: number;
  pageSize: number;
}) => Promise<BreweryComment[]>;

export type FindDeleteBreweryCommentById = (args: {
  breweryCommentId: string;
}) => Promise<BreweryComment | null>;

export type GetBreweryCommentCount = (args: { breweryPostId: string }) => Promise<number>;
