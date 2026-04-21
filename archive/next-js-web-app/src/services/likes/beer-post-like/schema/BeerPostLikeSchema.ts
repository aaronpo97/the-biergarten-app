import { z } from 'zod';

const BeerPostLikeSchema = z.object({
  id: z.string().cuid(),
  beerPostId: z.string().cuid(),
  likedById: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});

export default BeerPostLikeSchema;
