import { z } from 'zod';

const BreweryPostQueryResult = z.object({
  id: z.string(),
  location: z.string(),
  name: z.string(),
  postedBy: z.object({ id: z.string(), username: z.string() }),
  breweryImages: z.array(
    z.object({ path: z.string(), caption: z.string(), id: z.string(), alt: z.string() }),
  ),
  createdAt: z.coerce.date(),
  dateEstablished: z.coerce.date(),
});

export default BreweryPostQueryResult;
