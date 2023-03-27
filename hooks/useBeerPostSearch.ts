import useSWR from 'swr';
import { beerPostQueryResultArraySchema } from '@/services/BeerPost/schema/BeerPostQueryResult';

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
      const result = beerPostQueryResultArraySchema.parse(json);

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
