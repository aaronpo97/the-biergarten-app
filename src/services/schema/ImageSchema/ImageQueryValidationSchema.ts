import { z } from 'zod';

const ImageQueryValidationSchema = z.object({
  id: z.string().cuid(),
  path: z.string().url(),
  alt: z.string(),
  caption: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
});

export default ImageQueryValidationSchema;
