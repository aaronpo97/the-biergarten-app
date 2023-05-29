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
});

export default GetUserSchema;
