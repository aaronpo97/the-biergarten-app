import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import useSWR from 'swr';
import { z } from 'zod';
/**
 * A custom React hook that searches for beer posts that match a given query string.
 *
 * @param query The search query string to match beer posts against.
 * @returns An object with the following properties:
 *
 *   - `searchResults`: The beer posts that match the search query.
 *   - `searchError`: The error that occurred while fetching the data.
 *   - `isLoading`: A boolean indicating whether the data is being fetched.
 */
const useBeerPostSearch = (query: string | undefined) => {
  const { data, isLoading, error } = useSWR(
    `/api/beers/search?search=${query}`,
    async (url) => {
      if (!query) return [];

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      const json = await response.json();
      const result = z.array(BeerPostQueryResult).parse(json);

      return result;
    },
  );

  return {
    searchResults: data,
    searchError: error as Error | undefined,
    isLoading,
  };
};

export default useBeerPostSearch;
