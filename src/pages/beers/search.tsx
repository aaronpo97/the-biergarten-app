import { NextPage } from 'next';

import { useRouter } from 'next/router';
import BeerCard from '@/components/BeerIndex/BeerCard';
import { ChangeEvent, useEffect, useState } from 'react';
import Spinner from '@/components/ui/Spinner';

import debounce from 'lodash/debounce';
import useBeerPostSearch from '@/hooks/useBeerPostSearch';
import FormLabel from '@/components/ui/forms/FormLabel';

const DEBOUNCE_DELAY = 300;

const SearchPage: NextPage = () => {
  const router = useRouter();
  const querySearch = (router.query.search as string) || '';
  const [searchValue, setSearchValue] = useState(querySearch);
  const { searchResults, isLoading, searchError } = useBeerPostSearch(searchValue);

  const debounceSearch = debounce((value: string) => {
    router.push({
      pathname: '/beers/search',
      query: { search: value },
    });
  }, DEBOUNCE_DELAY);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchValue(value);
    debounceSearch(value);
  };

  useEffect(() => {
    debounce(() => {
      if (!querySearch || searchValue) {
        return;
      }
      setSearchValue(querySearch);
    }, DEBOUNCE_DELAY)();
  }, [querySearch, searchValue]);

  const showSearchResults = !isLoading && searchResults && !searchError;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <div className="h-full w-full space-y-20">
        <div className="flex h-[50%] w-full items-center justify-center bg-base-200">
          <div className="w-8/12">
            <FormLabel htmlFor="search">What are you looking for?</FormLabel>
            <input
              type="text"
              id="search"
              className="input-bordered input w-full rounded-lg"
              onChange={onChange}
              value={searchValue}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          {!showSearchResults ? (
            <Spinner size="lg" />
          ) : (
            <div className="grid w-8/12 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((result) => {
                return <BeerCard key={result.id} post={result} />;
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
