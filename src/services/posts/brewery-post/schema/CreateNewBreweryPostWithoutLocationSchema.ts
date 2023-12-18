import { z } from 'zod';
import CreateBreweryPostSchema from './CreateBreweryPostSchema';

const CreateNewBreweryPostWithoutLocationSchema = CreateBreweryPostSchema.omit({
  address: true,
  city: true,
  country: true,
  stateOrProvince: true,
}).extend({
  userId: z.string().cuid(),
  locationId: z.string().cuid(),
});

export default CreateNewBreweryPostWithoutLocationSchema;
