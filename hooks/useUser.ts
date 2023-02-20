import GetUserSchema from '@/services/User/schema/GetUserSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWR from 'swr';

const useUser = () => {
  // check cookies for user
  const {
    data: user,
    error,
    isLoading,
  } = useSWR('/api/users/current', async (url) => {
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
    if (!parsedPayload.success) {
      throw new Error(parsedPayload.error.message);
    }

    return parsedPayload.data;
  });

  return { user, isLoading, error: error as unknown };
};

export default useUser;
