import { z } from 'zod';

const BreweryPostQueryResult = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  location: z.object({
    city: z.string(),
    address: z.string(),
    coordinates: z.tuple([z.number(), z.number()]),
    country: z.string().nullable(),
    stateOrProvince: z.string().nullable(),
  }),
  postedBy: z.object({ id: z.string(), username: z.string() }),
  breweryImages: z.array(
    z.object({ path: z.string(), caption: z.string(), id: z.string(), alt: z.string() }),
  ),
  createdAt: z.coerce.date(),
  dateEstablished: z.coerce.date(),
});

export default BreweryPostQueryResult;
