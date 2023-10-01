import { z } from 'zod';

const BeerCommentQueryResult = z.object({
  id: z.string().cuid(),
  content: z.string(),
  rating: z.number(),
  postedBy: z.object({
    id: z.string().cuid(),
    username: z.string(),
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});

export default BeerCommentQueryResult;
