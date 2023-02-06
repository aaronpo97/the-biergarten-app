import { z } from 'zod';

const GetUserSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()).optional(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.date().or(z.string()),
});

export default GetUserSchema;
