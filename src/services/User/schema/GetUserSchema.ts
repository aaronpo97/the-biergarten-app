import { z } from 'zod';

const GetUserSchema = z.object({
  id: z.string().cuid(),
  username: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date().nullable(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.coerce.date(),
  accountIsVerified: z.boolean(),
  role: z.enum(['USER', 'ADMIN']),
  bio: z.string().nullable(),
  userAvatar: z
    .object({
      id: z.string().cuid(),
      path: z.string().url(),
      alt: z.string(),
      caption: z.string(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().nullable(),
    })
    .nullable(),
});

export default GetUserSchema;
