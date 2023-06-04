import { UpdatePasswordSchema } from '@/services/User/schema/CreateUserValidationSchemas';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const sendUpdatePasswordRequest = async (data: z.infer<typeof UpdatePasswordSchema>) => {
  const response = await fetch('/api/users/edit-password', {
    body: JSON.stringify(data),
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }
  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('API response validation failed.');
  }

  return parsed.data;
};

export default sendUpdatePasswordRequest;
