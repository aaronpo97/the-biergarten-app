import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

const sendUserFollowRequest = async (userId: string) => {
  const response = await fetch(`/api/users/${userId}/follow-user`, { method: 'POST' });
  const json = await response.json();

  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error('Invalid API response.');
  }

  return parsed;
};

export default sendUserFollowRequest;
