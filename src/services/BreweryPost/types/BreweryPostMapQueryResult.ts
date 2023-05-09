import { z } from "zod";

const BreweryPostMapQueryResult = z.object({
  location: z.object({
    coordinates: z.array(z.number()),
    city: z.string(),
    country: z.string().nullable(),
    stateOrProvince: z.string().nullable(),
  }),
  id: z.string(),
  name: z.string(),
});

export default BreweryPostMapQueryResult;
