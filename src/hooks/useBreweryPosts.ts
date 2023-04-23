import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

/**
 * A custom hook using SWR to fetch brewery posts from the API.
 *
 * @param options The options to use when fetching brewery posts.
 * @param options.pageSize The number of brewery posts to fetch per page.
 * @returns An object containing the brewery posts, page count, and loading state.
 */
const useBreweryPosts = ({ pageSize }: { pageSize: number }) => {
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

    const parsedPayload = z.array(BreweryPostQueryResult).safeParse(parsed.data.payload);
    if (!parsedPayload.success) {
      throw new Error('API response validation failed');
    }

    const pageCount = Math.ceil(parseInt(count as string, 10) / pageSize);
    return {
      breweryPosts: parsedPayload.data,
      pageCount,
    };
  };

  const { data, error, isLoading, setSize, size } = useSWRInfinite(
    (index) => `/api/breweries?pageNum=${index + 1}&pageSize=${pageSize}`,
    fetcher,
  );

  const breweryPosts = data?.flatMap((d) => d.breweryPosts) ?? [];
  const pageCount = data?.[0].pageCount ?? 0;
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
  const isAtEnd = !(size < data?.[0].pageCount!);

  return {
    breweryPosts,
    pageCount,
    size,
    setSize,
    isLoading,
    isLoadingMore,
    isAtEnd,
    error: error as unknown,
  };
};

export default useBreweryPosts;
