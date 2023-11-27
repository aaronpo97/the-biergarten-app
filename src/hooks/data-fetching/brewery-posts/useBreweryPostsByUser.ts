import BreweryPostQueryResult from '@/services/BreweryPost/schema/BreweryPostQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

interface UseBreweryPostsByUserParams {
  pageSize: number;
  userId: string;
}

const useBreweryPostsByUser = ({ pageSize, userId }: UseBreweryPostsByUserParams) => {
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
    return { breweryPosts: parsedPayload.data, pageCount };
  };

  const { data, error, isLoading, setSize, size } = useSWRInfinite(
    (index) =>
      `/api/users/${userId}/posts/breweries?page_num=${index + 1}&page_size=${pageSize}`,
    fetcher,
    { parallel: true },
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

export default useBreweryPostsByUser;
