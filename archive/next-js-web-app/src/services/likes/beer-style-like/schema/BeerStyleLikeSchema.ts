import { z } from 'zod';

const BeerStyleLikeSchema = z.object({
  id: z.string().cuid(),
  beerStyleId: z.string().cuid(),
  likedById: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});

export default BeerStyleLikeSchema;
