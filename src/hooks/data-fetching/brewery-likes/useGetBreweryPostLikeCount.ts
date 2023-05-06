import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWR from 'swr';
import { z } from 'zod';

/**
 * A custom React hook that fetches the number of likes a brewery post has.
 *
 * @param breweryPostId
 * @returns An object with the following properties:
 *
 *   - `likeCount`: The number of likes the brewery post has.
 *   - `error`: The error that occurred while fetching the data.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `mutate`: A function to mutate the data.
 */
const useGetBreweryPostLikeCount = (breweryPostId: string) => {
  const { error, mutate, data, isLoading } = useSWR(
    `/api/breweries/${breweryPostId}/like`,
    async (url) => {
      const response = await fetch(url);
      const json = await response.json();

      const parsed = APIResponseValidationSchema.safeParse(json);
      if (!parsed.success) {
        throw new Error('Failed to parse API response');
      }

      const parsedPayload = z
        .object({ likeCount: z.number() })
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

export default useGetBreweryPostLikeCount;
