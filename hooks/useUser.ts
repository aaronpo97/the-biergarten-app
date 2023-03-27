import GetUserSchema from '@/services/User/schema/GetUserSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWR from 'swr';

const useUser = () => {
  const {
    data: user,
    error,
    isLoading,
  } = useSWR('/api/users/current', async (url) => {
    if (!document.cookie.includes('token')) {
      throw new Error('No token cookie found');
    }
    const response = await fetch(url);

    if (!response.ok) {
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      throw new Error(response.statusText);
    }

    const json = await response.json();

    const parsed = APIResponseValidationSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    const parsedPayload = GetUserSchema.safeParse(parsed.data.payload);
    console.log(parsedPayload);
    if (!parsedPayload.success) {
      throw new Error(parsedPayload.error.message);
    }

    return parsedPayload.data;
  });

  return { user, isLoading, error: error as unknown };
};

export default useUser;
