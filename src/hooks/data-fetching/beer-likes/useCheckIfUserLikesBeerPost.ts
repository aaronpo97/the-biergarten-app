import UserContext from '@/contexts/UserContext';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { useContext } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

/**
 * A custom React hook that checks if the current user has liked a beer post by fetching
 * data from the server.
 *
 * @param beerPostId The ID of the beer post to check for likes.
 * @returns An object with the following properties:
 *
 *   - `error`: The error that occurred while fetching the data.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `mutate`: A function to mutate the data.
 *   - `isLiked`: A boolean indicating whether the current user has liked the beer post.
 */
const useCheckIfUserLikesBeerPost = (beerPostId: string) => {
  const { user } = useContext(UserContext);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/beers/${beerPostId}/like/is-liked`,
    async (url) => {
      if (!user) {
        throw new Error('User is not logged in.');
      }

      const response = await fetch(url);
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

export default useCheckIfUserLikesBeerPost;
