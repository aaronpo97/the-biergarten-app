import { z } from 'zod';

const BeerCommentQueryResult = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(500),
  rating: z.number().int().min(1).max(5),
  createdAt: z.coerce.date(),
  postedBy: z.object({
    id: z.string().uuid(),
    username: z.string().min(1).max(50),
  }),
});

export default BeerCommentQueryResult;
