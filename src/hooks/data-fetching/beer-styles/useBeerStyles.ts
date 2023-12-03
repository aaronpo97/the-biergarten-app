import BeerStyleQueryResult from '@/services/BeerStyles/schema/BeerStyleQueryResult';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import useSWRInfinite from 'swr/infinite';
import { z } from 'zod';

/**
 * A custom hook to fetch beer styles posts.
 *
 * @param options The options to use when fetching beer types.
 * @param options.pageSize The number of beer types to fetch per page.
 * @returns An object with the following properties:
 *
 *   - `beerStyles`: The beer styles fetched from the API.
 *   - `error`: The error that occurred while fetching the data.
 *   - `isAtEnd`: A boolean indicating whether all data has been fetched.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 *   - `isLoadingMore`: A boolean indicating whether more data is being fetched.
 *   - `pageCount`: The total number of pages of data.
 *   - `setSize`: A function to set the size of the data.
 *   - `size`: The size of the data.
 */
const useBeerStyles = ({ pageSize }: { pageSize: number }) => {
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

    const parsedPayload = z.array(BeerStyleQueryResult).safeParse(parsed.data.payload);
    if (!parsedPayload.success) {
      throw new Error('API response validation failed');
    }

    const pageCount = Math.ceil(parseInt(count as string, 10) / pageSize);
    return {
      beerStyles: parsedPayload.data,
      pageCount,
    };
  };

  const { data, error, isLoading, setSize, size } = useSWRInfinite(
    (index) => `/api/beers/styles?page_num=${index + 1}&page_size=${pageSize}`,
    fetcher,
    { parallel: true },
  );

  const beerStyles = data?.flatMap((d) => d.beerStyles) ?? [];
  const pageCount = data?.[0].pageCount ?? 0;
  const isLoadingMore = size > 0 && data && typeof data[size - 1] === 'undefined';
  const isAtEnd = !(size < data?.[0].pageCount!);

  return {
    beerStyles,
    error: error as unknown,
    isAtEnd,
    isLoading,
    isLoadingMore,
    pageCount,
    setSize,
    size,
  };
};

export default useBeerStyles;
