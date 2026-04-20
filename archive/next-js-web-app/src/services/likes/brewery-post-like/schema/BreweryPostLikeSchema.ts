import { z } from 'zod';

const BreweryPostLikeSchema = z.object({
  id: z.string().cuid(),
  breweryPostId: z.string().cuid(),
  likedById: z.string().cuid(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});

export default BreweryPostLikeSchema;
