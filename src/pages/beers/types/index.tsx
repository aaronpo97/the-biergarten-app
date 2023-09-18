import LoadingCard from '@/components/ui/LoadingCard';
import Spinner from '@/components/ui/Spinner';
import useBeerTypes from '@/hooks/data-fetching/beer-types/useBeerTypes';

import { NextPage } from 'next';
import Head from 'next/head';
import { MutableRefObject, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';

const BeerTypePage: NextPage = () => {
  const PAGE_SIZE = 20;
  const pageRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const { beerTypes, isLoading, isLoadingMore, isAtEnd, size, setSize, error } =
    useBeerTypes({
      pageSize: PAGE_SIZE,
    });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { ref: lastBeerTypeRef } = useInView({
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });

  console.log(error);
  console.log(beerTypes);
  return (
    <>
      <Head>
        <title>Beer Types | The Biergarten App</title>
        <meta
          name="description"
          content="Find beers made by breweries near you and around the world."
        />
      </Head>
      <div className="flex items-center justify-center bg-base-100" ref={pageRef}>
        <div className="my-10 flex w-10/12 flex-col space-y-4 lg:w-8/12 2xl:w-7/12">
          <header className="my-10 flex justify-between lg:flex-row">
            <div>
              <h1 className="text-4xl font-bold lg:text-6xl">The Biergarten App</h1>
              <h2 className="text-2xl font-bold lg:text-4xl">Beers</h2>
            </div>
          </header>
          <div className="grid gap-6 xl:grid-cols-2">
            {!!beerTypes.length && !isLoading && (
              <>
                {beerTypes.map((beerType, i) => {
                  return (
                    <div
                      key={beerType.id}
                      ref={beerTypes.length === i + 1 ? lastBeerTypeRef : undefined}
                    >
                      {beerType.name}
                    </div>
                  );
                })}
              </>
            )}
            {(isLoading || isLoadingMore) && (
              <>
                {Array.from({ length: PAGE_SIZE }, (_, i) => (
                  <LoadingCard key={i} />
                ))}
              </>
            )}
          </div>

          {(isLoading || isLoadingMore) && (
            <div className="flex h-32 w-full items-center justify-center">
              <Spinner size="sm" />
            </div>
          )}

          {isAtEnd && !isLoading && (
            <div className="flex h-20 items-center justify-center text-center">
              <div
                className="tooltip tooltip-bottom"
                data-tip="Scroll back to top of page."
              >
                <button
                  type="button"
                  className="btn-ghost btn-sm btn"
                  aria-label="Scroll back to top of page."
                  onClick={() => {
                    pageRef.current?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }}
                >
                  <FaArrowUp />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BeerTypePage;
