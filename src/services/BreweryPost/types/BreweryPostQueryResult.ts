import { z } from 'zod';

const BreweryPostQueryResult = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  address: z.string(),
  city: z.string(),
  stateOrProvince: z.string().or(z.null()),
  coordinates: z.array(z.number()),
  country: z.string().or(z.null()),
  postedBy: z.object({ id: z.string(), username: z.string() }),
  breweryImages: z.array(
    z.object({ path: z.string(), caption: z.string(), id: z.string(), alt: z.string() }),
  ),
  createdAt: z.coerce.date(),
  dateEstablished: z.coerce.date(),
});

export default BreweryPostQueryResult;
