import ImageQueryValidationSchema from '@/services/schema/ImageSchema/ImageQueryValidationSchema';
import { z } from 'zod';

const BeerPostQueryResult = z.object({
  id: z.string(),
  name: z.string(),
  brewery: z.object({ id: z.string(), name: z.string() }),
  description: z.string(),
  beerImages: z.array(ImageQueryValidationSchema),
  ibu: z.number(),
  abv: z.number(),
  style: z.object({ id: z.string(), name: z.string(), description: z.string() }),
  postedBy: z.object({ id: z.string(), username: z.string() }),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});

export default BeerPostQueryResult;
