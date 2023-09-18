import BeerTypeQueryResult from '@/services/BeerTypes/schema/BeerTypeQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

/**
 * A custom hook using SWR to fetch beer types from the API.
 *
 * @param options The options to use when fetching beer types.
 * @param options.pageSize The number of beer types to fetch per page.
 * @returns An object with the following properties:
 *
 *   - `beerTypes`: The beer types fetched from the API.
 *   - `error`: The error that occurred while fetching the data.
 *   - `isAtEnd`: A boolean indicating whether all data has been fetched.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isLoadingMore`: A boolean indicating whether more data is being fetched.
 *   - `pageCount`: The total number of pages of data.
 *   - `setSize`: A function to set the size of the data.
 *   - `size`: The size of the data.
 */
const useBeerTypes = ({ pageSize }: { pageSize: number }) => {
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

    const parsedPayload = z.array(BeerTypeQueryResult).safeParse(parsed.data.payload);
    if (!parsedPayload.success) {
      console.log(parsedPayload.error);
      throw new Error('API response validation failed');
    }

    const pageCount = Math.ceil(parseInt(count as string, 10) / pageSize);
    return {
      beerTypes: parsedPayload.data,
      pageCount,
    };
  };

  const { data, error, isLoading, setSize, size } = useSWRInfinite(
    (index) => `/api/beers/types?page_num=${index + 1}&page_size=${pageSize}`,
    fetcher,
    { parallel: true },
  );

  const beerTypes = data?.flatMap((d) => d.beerTypes) ?? [];
  const pageCount = data?.[0].pageCount ?? 0;
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
  const isAtEnd = !(size < data?.[0].pageCount!);

  return {
    beerTypes,
    error: error as unknown,
    isAtEnd,
    isLoading,
    isLoadingMore,
    pageCount,
    setSize,
    size,
  };
};

export default useBeerTypes;
