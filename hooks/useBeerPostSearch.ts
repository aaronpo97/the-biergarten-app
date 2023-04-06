import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import useSWR from 'swr';
import { z } from 'zod';
/**
 * A custom React hook that searches for beer posts that match a given query string.
 *
 * @param query The search query string to match beer posts against.
 * @returns An object containing an array of search results matching the query, an error
 *   object if an error occurred during the search, and a boolean indicating if the
 *   request is currently loading.
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
      const result = z.array(beerPostQueryResult).parse(json);

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
