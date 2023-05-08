import UserContext from '@/contexts/userContext';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { useContext } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

/**
 * A custom React hook that checks if the current user likes a given brewery post.
 *
 * @param breweryPostId - The ID of the brewery post to check.
 * @returns An object with the following properties:
 *
 *   - `isLiked`: A boolean indicating whether the current user likes the brewery post.
 *   - `error`: The error that occurred while fetching the data.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `mutate`: A function to mutate the data.
 */

const useCheckIfUserLikesBreweryPost = (breweryPostId: string) => {
  const { user } = useContext(UserContext);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/breweries/${breweryPostId}/like/is-liked`,
    async () => {
      if (!user) {
        throw new Error('User is not logged in.');
      }

      const response = await fetch(`/api/breweries/${breweryPostId}/like/is-liked`);
      const json = await response.json();

      const parsed = APIResponseValidationSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error('Invalid API response.');
      }

      const { payload } = parsed.data;
      const parsedPayload = z.object({ isLiked: z.boolean() }).safeParse(payload);

      if (!parsedPayload.success) {
        throw new Error('Invalid API response.');
      }

      const { isLiked } = parsedPayload.data;

      return isLiked;
    },
  );

  return {
    isLiked: data,
    error: error as unknown,
    isLoading,
    mutate,
  };
};

export default useCheckIfUserLikesBreweryPost;
