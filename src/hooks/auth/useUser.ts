import GetUserSchema from '@/services/User/schema/GetUserSchema';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWR from 'swr';

/**
 * A custom React hook that fetches the current user's data from the server.
 *
 * @returns An object with the following properties:
 *
 *   - `user`: The current user's data.
 *   - `isLoading`: A boolean indicating whether the request is still in progress.
 *   - `error`: An error object if the user is not logged in, if the response data fails to
 *       validate against the expected schema, or if the server returns an error.
 *   - `mutate`: A function that can be used to mutate the current user's data.
 */
const useUser = () => {
  const {
    data: user,
    error,
    isLoading,
    mutate,
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

    console.log(parsedPayload)
    if (!parsedPayload.success) {
      throw new Error(parsedPayload.error.message);
    }

    return parsedPayload.data;
  });


  return { user, isLoading, error: error as unknown, mutate };
};

export default useUser;
