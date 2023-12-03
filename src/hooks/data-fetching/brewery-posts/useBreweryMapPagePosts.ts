import BreweryPostMapQueryResult from '@/services/BreweryPost/schema/BreweryPostMapQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

/**
 * A custom hook to fetch brewery posts for the map.
 *
 * @param options The options to use when fetching brewery posts.
 * @param options.pageSize The number of brewery posts to fetch per page.
 * @returns An object with the following properties:
 *
 *   - `breweryPosts`: The brewery posts fetched from the API.
 *   - `error`: The error that occurred while fetching the data.
 *   - `isAtEnd`: A boolean indicating whether all data has been fetched.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isLoadingMore`: A boolean indicating whether more data is being fetched.
 *   - `pageCount`: The total number of pages of data.
 *   - `setSize`: A function to set the size of the data.
 *   - `size`: The size of the data.
 */
const useBreweryMapPagePosts = ({ pageSize }: { pageSize: number }) => {
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

    const parsedPayload = z
      .array(BreweryPostMapQueryResult)
      .safeParse(parsed.data.payload);
    if (!parsedPayload.success) {
      throw new Error('API payload validation failed');
    }

    const pageCount = Math.ceil((count as string, 10) / pageSize);

    return { breweryPosts: parsedPayload.data, pageCount };
  };

  const { data, error, isLoading, setSize, size } = useSWRInfinite(
    (index) => `/api/breweries/map?page_num=${index + 1}&page_size=${pageSize}`,
    fetcher,
  );

  const breweryPosts = data?.flatMap((d) => d.breweryPosts) ?? [];
  const pageCount = data?.[0].pageCount ?? 0;

  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
  const isAtEnd = !(size < data?.[0].pageCount!);

  return {
    breweries: breweryPosts,
    isLoading,
    isLoadingMore,
    isAtEnd,
    size,
    setSize,
    pageCount,
    error: error as unknown,
  };
};

export default useBreweryMapPagePosts;
