import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWR from 'swr';
import { z } from 'zod';

/**
 * A custom hook to check if the current user follows a given user.
 *
 * @param userFollowedId - The ID of the user to check.
 * @returns An object with the following properties:
 *
 *   - `isFollowed`: A boolean indicating whether the current user follows the user.
 *   - `error`: The error that occurred while fetching the data.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `mutate`: A function to mutate the data.
 */
const useFollowStatus = (userFollowedId: string) => {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/users/${userFollowedId}/is-followed`,
    async (url) => {
      const response = await fetch(url);
      const json = await response.json();
      const parsed = APIResponseValidationSchema.safeParse(json);

      if (!parsed.success) {
        throw new Error('Invalid API response.');
      }

      const { payload } = parsed.data;
      const parsedPayload = z.object({ isFollowed: z.boolean() }).safeParse(payload);

      if (!parsedPayload.success) {
        throw new Error('Invalid API response.');
      }

      const { isFollowed } = parsedPayload.data;

      return isFollowed;
    },
  );

  return {
    isFollowed: data,
    error: error as unknown,
    isLoading,
    mutate,
  };
};

export default useFollowStatus;
