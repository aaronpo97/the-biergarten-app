import { z } from 'zod';

const CreateBeerStyleValidationSchema = z.object({
  glasswareId: z
    .string()
    .cuid({
      message: 'Glassware ID must be a valid CUID.',
    })
    .min(1, { message: 'Glassware ID is required.' }),
  description: z
    .string()
    .min(1, { message: 'Description is required.' })
    .max(500, { message: 'Description must be less than or equal to 500 characters.' }),
  ibuRange: z
    .tuple([
      z
        .number()
        .min(0, { message: 'IBU range minimum must be greater than or equal to 0.' })
        .max(100, { message: 'IBU range minimum must be less than or equal to 100.' }),
      z
        .number()
        .min(0, { message: 'IBU range maximum must be greater than or equal to 0.' })
        .max(100, { message: 'IBU range maximum must be less than or equal to 100.' }),
    ])
    .refine((ibuRange) => ibuRange[0] <= ibuRange[1], {
      message: 'IBU range minimum must be less than or equal to maximum.',
    }),
  abvRange: z
    .tuple([
      z
        .number()
        .min(0, { message: 'ABV range minimum must be greater than or equal to 0.' }),
      z
        .number()
        .min(0, { message: 'ABV range maximum must be greater than or equal to 0.' }),
    ])
    .refine((abvRange) => abvRange[0] <= abvRange[1], {
      message: 'ABV range minimum must be less than or equal to maximum.',
    }),
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .max(100, { message: 'Name must be less than or equal to 100 characters.' }),
});

export default CreateBeerStyleValidationSchema;
