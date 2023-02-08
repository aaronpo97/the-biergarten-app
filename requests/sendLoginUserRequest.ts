import { BasicUserInfoSchema } from '@/config/auth/types';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

const sendLoginUserRequest = async (data: { username: string; password: string }) => {
  const response = await fetch('/api/users/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const json: unknown = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);
  if (!parsed.success) {
    throw new Error('API response validation failed');
  }

  const parsedPayload = BasicUserInfoSchema.safeParse(parsed.data.payload);
  if (!parsedPayload.success) {
    throw new Error('API response payload validation failed');
  }

  return parsedPayload.data;
};

export default sendLoginUserRequest;
