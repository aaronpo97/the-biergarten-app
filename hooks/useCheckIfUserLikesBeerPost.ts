import UserContext from '@/contexts/userContext';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { useContext } from 'react';
import useSWR from 'swr';
import { z } from 'zod';

/**
 * A custom React hook that checks if the current user has liked a beer post by fetching
 * data from the server.
 *
 * @param beerPostId The ID of the beer post to check for likes.
 * @returns An object containing a boolean indicating if the user has liked the beer post,
 *   an error object if an error occurred during the request, and a boolean indicating if
 *   the request is currently loading.
 * @throws When the user is not logged in, the server returns an error status code, or if
 *   the response data fails to validate against the expected schema.
 */
const useCheckIfUserLikesBeerPost = (beerPostId: string) => {
  const { user } = useContext(UserContext);
  const { data, error, isLoading, mutate } = useSWR(
    `/api/beers/${beerPostId}/like/is-liked`,
    async () => {
      if (!user) {
        throw new Error('User is not logged in.');
      }

      const response = await fetch(`/api/beers/${beerPostId}/like/is-liked`);
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
