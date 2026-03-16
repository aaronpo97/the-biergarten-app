import { z } from 'zod';

const BeerStyleQueryResult = z.object({
  abvRange: z.tuple([z.number(), z.number()]),
  createdAt: z.coerce.date(),
  description: z.string(),
  glassware: z.object({ id: z.string().cuid(), name: z.string() }),
  ibuRange: z.tuple([z.number(), z.number()]),
  id: z.string().cuid(),
  name: z.string(),
  postedBy: z.object({ id: z.string().cuid(), username: z.string() }),
  updatedAt: z.coerce.date().nullable(),
});

export default BeerStyleQueryResult;
