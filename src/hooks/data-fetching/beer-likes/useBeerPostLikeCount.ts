import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';
import useSWR from 'swr';

/**
 * A custom hook to fetch the like count for a beer post from the server.
 *
 * @param beerPostId - The ID of the beer post to fetch the like count for.
 * @returns An object with the following properties:
 *
 *   - `error`: The error that occurred while fetching the like count.
 *   - `isLoading`: A boolean indicating whether the like count is being fetched.
 *   - `mutate`: A function to mutate the like count.
 *   - `likeCount`: The like count for the beer post.
 */

const useGetBeerPostLikeCount = (beerPostId: string) => {
  const { error, mutate, data, isLoading } = useSWR(
    `/api/beers/${beerPostId}/like`,
    async (url) => {
      const response = await fetch(url);
      const json = await response.json();

      const parsed = APIResponseValidationSchema.safeParse(json);

      if (!parsed.success) {
        throw new Error('Failed to parse API response');
      }

      const parsedPayload = z
        .object({
          likeCount: z.number(),
        })
        .safeParse(parsed.data.payload);

      if (!parsedPayload.success) {
        throw new Error('Failed to parse API response payload');
      }

      return parsedPayload.data.likeCount;
    },
  );

  return {
    error: error as unknown,
    isLoading,
    mutate,
    likeCount: data as number | undefined,
  };
};

export default useGetBeerPostLikeCount;
