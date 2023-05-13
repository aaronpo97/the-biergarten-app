import { NextPage } from 'next';
import BeerCard from '@/components/BeerIndex/BeerCard';
import Head from 'next/head';
import { MutableRefObject, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import Spinner from '@/components/ui/Spinner';
import useBeerPosts from '@/hooks/data-fetching/beer-posts/useBeerPosts';
import { FaArrowUp } from 'react-icons/fa';
import LoadingCard from '@/components/ui/LoadingCard';

const BeerPage: NextPage = () => {
  const PAGE_SIZE = 6;

  const { beerPosts, setSize, size, isLoading, isLoadingMore, isAtEnd } = useBeerPosts({
    pageSize: PAGE_SIZE,
  });

  const { ref: lastBeerPostRef } = useInView({
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });

  const pageRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  return (
    <>
      <Head>
        <title>Beers | The Biergarten App</title>
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
            {!!beerPosts.length && !isLoading && (
              <>
                {beerPosts.map((beerPost, i) => {
                  return (
                    <div
                      key={beerPost.id}
                      ref={beerPosts.length === i + 1 ? lastBeerPostRef : undefined}
                    >
                      <BeerCard post={beerPost} />
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

export default BeerPage;
