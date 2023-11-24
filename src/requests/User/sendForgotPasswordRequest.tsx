import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';

const sendForgotPasswordRequest = async (email: string) => {
  const response = await fetch('/api/users/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error("Something went wrong and we couldn't send the reset link.");
  }

  const json = await response.json();
  const parsed = APIResponseValidationSchema.safeParse(json);

  if (!parsed.success) {
    throw new Error(parsed.error.message);
  }

  return parsed.data;
};

export default sendForgotPasswordRequest;
