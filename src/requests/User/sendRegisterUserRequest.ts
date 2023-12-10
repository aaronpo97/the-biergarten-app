import { CreateUserValidationSchema } from '@/services/users/User/schema/CreateUserValidationSchemas';
import GetUserSchema from '@/services/users/User/schema/GetUserSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

async function sendRegisterUserRequest(data: z.infer<typeof CreateUserValidationSchema>) {
  const response = await fetch('/api/users/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('API response validation failed.');
  }

  if (!parsed.data.success) {
    throw new Error(parsed.data.message);
  }

  const parsedPayload = GetUserSchema.safeParse(parsed.data.payload);

  if (!parsedPayload.success) {
    throw new Error('API response payload validation failed.');
  }

  return parsedPayload.data;
}

export default sendRegisterUserRequest;
