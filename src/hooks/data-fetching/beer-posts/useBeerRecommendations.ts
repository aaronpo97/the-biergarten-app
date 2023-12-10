import BeerPostQueryResult from '@/services/posts/BeerPost/schema/BeerPostQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

interface UseBeerRecommendationsParams {
  pageSize: number;
  beerPost: z.infer<typeof BeerPostQueryResult>;
}

/**
 * A custom hook to fetch beer recommendations from the API.
 *
 * @param options The options to use when fetching beer recommendations.
 * @param options.pageSize The number of beer recommendations to fetch per page.
 * @param options.beerPost The beer post to fetch recommendations for.
 * @returns An object with the following properties:
 *
 *   - `beerPosts`: The beer posts fetched from the API.
 *   - `error`: The error that occurred while fetching the data.
 *   - `isAtEnd`: A boolean indicating whether all data has been fetched.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isLoadingMore`: A boolean indicating whether more data is being fetched.
 *   - `pageCount`: The total number of pages of data.
 *   - `setSize`: A function to set the size of the data.
 *   - `size`: The size of the data.
 */
const UseBeerPostsByBrewery = ({ pageSize, beerPost }: UseBeerRecommendationsParams) => {
  const fetcher = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(response.statusText);
    }

    const json = await response.json();
    const count = response.headers.get('X-Total-Count');

    const parsed = APIResponseValidationSchema.safeParse(json);
    if (!parsed.success) {
      throw new Error('API response validation failed');
    }

    const parsedPayload = z.array(BeerPostQueryResult).safeParse(parsed.data.payload);
    if (!parsedPayload.success) {
      throw new Error('API response validation failed');
    }

    const pageCount = Math.ceil(parseInt(count as string, 10) / pageSize);
    return {
      beerPosts: parsedPayload.data,
      pageCount,
    };
  };

  const { data, error, isLoading, setSize, size } = useSWRInfinite(
    (index) =>
      `/api/beers/${beerPost.id}/recommendations/?page_num=${
        index + 1
      }&page_size=${pageSize}`,
    fetcher,
  );

  const beerPosts = data?.flatMap((d) => d.beerPosts) ?? [];
  const pageCount = data?.[0].pageCount ?? 0;
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
  const isAtEnd = !(size < data?.[0].pageCount!);

  return {
    beerPosts,
    pageCount,
    size,
    setSize,
    isLoading,
    isLoadingMore,
    isAtEnd,
    error: error as unknown,
  };
};

export default UseBeerPostsByBrewery;
