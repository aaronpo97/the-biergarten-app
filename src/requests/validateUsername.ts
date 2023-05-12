import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const validateUsername = async (username: string) => {
  const response = await fetch(`/api/users/check-username?username=${username}`);
  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    return false;
  }

  const parsedPayload = z
    .object({ usernameIsTaken: z.boolean() })
    .safeParse(parsed.data.payload);

  if (!parsedPayload.success) {
    return false;
  }

  return !parsedPayload.data.usernameIsTaken;
};

export default validateUsername;
