import { isPast } from 'date-fns';
import { z } from 'zod';

const CreateBreweryPostSchema = z.object({
  name: z
    .string({
      required_error: 'Brewery name is required.',
      invalid_type_error: 'Brewery name must be a string.',
    })
    .min(1, { message: 'Brewery name is required.' })
    .max(100, { message: 'Brewery name is too long.' }),
  description: z
    .string({
      required_error: 'Description is required.',
      invalid_type_error: 'Description must be a string.',
    })
    .min(1, { message: 'Description is required.' })
    .max(500, { message: 'Description is too long.' }),
  address: z
    .string({
      required_error: 'Address is required.',
      invalid_type_error: 'Address must be a string.',
    })
    .min(1, { message: 'Address is required.' })
    .max(100, { message: 'Address is too long.' }),

  city: z
    .string({
      required_error: 'City is required.',
      invalid_type_error: 'City must be a string.',
    })
    .min(1, { message: 'City is required.' })
    .max(100, { message: 'City is too long.' }),

  region: z
    .string({ invalid_type_error: 'region must be a string.' })
    .min(1, { message: 'region is required.' })
    .max(100, { message: 'region is too long.' })
    .optional(),

  country: z
    .string({ invalid_type_error: 'Country must be a string.' })
    .max(100, { message: 'Country is too long.' })
    .optional(),

  dateEstablished: z.coerce
    .date({
      required_error: 'Date established is required.',
      invalid_type_error: 'Date established must be a date string.',
    })
    .refine((val) => !Number.isNaN(val.toString()), { message: 'Date is invalid.' })
    .refine((val) => isPast(new Date(val)), { message: 'Date must be in the past.' }),
});

export default CreateBreweryPostSchema;
