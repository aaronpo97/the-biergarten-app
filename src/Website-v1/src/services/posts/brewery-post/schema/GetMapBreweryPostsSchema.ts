import { z } from 'zod';

const GetMapBreweryPostsSchema = z.object({
  name: z.string(),
  id: z.string().cuid(),
  location: z.object({
    city: z.string(),
    country: z.string().nullable(),
    stateOrProvince: z.string().nullable(),
    coordinates: z.array(z.number(), z.number()),
  }),
});

export default GetMapBreweryPostsSchema;
