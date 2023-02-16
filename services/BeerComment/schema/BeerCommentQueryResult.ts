import { z } from 'zod';

export const BeerCommentQueryResult = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(300),
  rating: z.number().int().min(1).max(5),
  createdAt: z.coerce.date(),
  postedBy: z.object({
    id: z.string().uuid(),
    username: z.string().min(1).max(50),
  }),
});
export const BeerCommentQueryResultArray = z.array(BeerCommentQueryResult);
export type BeerCommentQueryResultT = z.infer<typeof BeerCommentQueryResult>;
export type BeerCommentQueryResultArrayT = z.infer<typeof BeerCommentQueryResultArray>;
