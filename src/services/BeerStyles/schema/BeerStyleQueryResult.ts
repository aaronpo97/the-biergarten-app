import { z } from 'zod';

const BeerStyleQueryResult = z.object({
  id: z.string().cuid(),
  name: z.string(),
  postedBy: z.object({
    id: z.string().cuid(),
    username: z.string(),
  }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  abvRange: z.tuple([z.number(), z.number()]),
  ibuRange: z.tuple([z.number(), z.number()]),
});

export default BeerStyleQueryResult;
