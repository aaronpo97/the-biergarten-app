import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

/**
 * A custom hook using SWR to fetch beer posts from the API.
 *
 * @param options The options to use when fetching beer posts.
 * @param options.pageSize The number of beer posts to fetch per page.
 * @returns An object containing the beer posts, page count, and loading state.
 */
const useBeerPosts = ({ pageSize }: { pageSize: number }) => {
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

    const parsedPayload = z.array(beerPostQueryResult).safeParse(parsed.data.payload);
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
    (index) => `/api/beers?page_num=${index + 1}&page_size=${pageSize}`,
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

export default useBeerPosts;
