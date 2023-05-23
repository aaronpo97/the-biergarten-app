import GetUserSchema from '@/services/User/schema/GetUserSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

interface SendEditUserRequestArgs {
  user: z.infer<typeof GetUserSchema>;
  data: {
    username: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

const sendEditUserRequest = async ({ user, data }: SendEditUserRequestArgs) => {
  const response = await fetch(`/api/users/${user!.id}/edit`, {
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

  return parsed;
};

export default sendEditUserRequest;
