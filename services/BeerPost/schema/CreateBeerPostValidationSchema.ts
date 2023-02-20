import { z } from 'zod';

const CreateBeerPostValidationSchema = z.object({
  name: z
    .string({
      required_error: 'Beer name is required.',
      invalid_type_error: 'Beer name must be a string.',
    })
    .min(1, { message: 'Beer name is required.' })
    .max(100, { message: 'Beer name is too long.' }),
  description: z
    .string()
    .min(1, { message: 'Description is required.' })
    .max(500, { message: 'Description is too long.' }),
  abv: z
    .number({
      required_error: 'ABV is required.',
      invalid_type_error: 'ABV must be a number.',
    })
    .min(0.1, { message: 'ABV must be greater than 0.1.' })
    .max(50, { message: 'ABV must be less than 50.' }),
  ibu: z
    .number({
      required_error: 'IBU is required.',
      invalid_type_error: 'IBU must be a number.',
    })
    .min(2, { message: 'IBU must be greater than 2.' })
    .max(100, { message: 'IBU must be less than 100.' }),
  typeId: z
    .string({
      required_error: 'Type id is required.',
      invalid_type_error: 'Type id must be a string.',
    })
    .uuid({ message: 'Invalid type id.' }),
  breweryId: z
    .string({
      required_error: 'Brewery id is required.',
      invalid_type_error: 'Brewery id must be a string.',
    })
    .uuid({ message: 'Invalid brewery id.' }),
});

export default CreateBeerPostValidationSchema;
