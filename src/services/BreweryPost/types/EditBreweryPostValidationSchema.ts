import { z } from 'zod';
import CreateBreweryPostSchema from './CreateBreweryPostSchema';

const EditBreweryPostValidationSchema = CreateBreweryPostSchema.extend({
  id: z.string().cuid(),
}).omit({
  address: true,
  city: true,
  region: true,
  country: true,
});

export default EditBreweryPostValidationSchema;
