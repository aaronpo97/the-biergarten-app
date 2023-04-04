import GetUserSchema from '@/services/User/schema/GetUserSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWR from 'swr';

/**
 * A custom React hook that fetches the current user's data from the server.
 *
 * @returns An object containing the current user's data, a boolean indicating if the
 *   request is currently loading, and an error object if an error occurred during the
 *   request.
 * @throws When the user is not logged in, the server returns an error status code, or if
 *   the response data fails to validate against the expected schema.
 */
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

    if (!parsedPayload.success) {
      throw new Error(parsedPayload.error.message);
    }

    return parsedPayload.data;
  });

  return { user, isLoading, error: error as unknown };
};

export default useUser;
