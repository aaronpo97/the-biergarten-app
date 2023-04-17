import { NextPage } from 'next';
import Layout from '@/components/ui/Layout';
import BeerCard from '@/components/BeerIndex/BeerCard';
import Head from 'next/head';
import Link from 'next/link';
import UserContext from '@/contexts/userContext';
import { MutableRefObject, useContext, useRef } from 'react';

import { useInView } from 'react-intersection-observer';
import Spinner from '@/components/ui/Spinner';
import useMediaQuery from '@/hooks/useMediaQuery';
import useGetBeerPosts from '@/hooks/useGetBeerPosts';
import BeerPostLoadingCard from '@/components/BeerIndex/BeerPostLoadingCard';
import { FaArrowUp } from 'react-icons/fa';

const BeerPage: NextPage = () => {
  const { user } = useContext(UserContext);

  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const PAGE_SIZE = isDesktop ? 3 : 1;

  const { beerPosts, setSize, size, isLoading, isLoadingMore, isAtEnd } = useGetBeerPosts(
    { pageSize: PAGE_SIZE },
  );

  const { ref: lastBeerPostRef } = useInView({
    onChange: (visible) => {
      if (!visible) return;
      setSize(size + 1);
    },
  });

  const pageRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  return (
    <Layout>
      <Head>
        <title>Beer</title>
        <meta name="description" content="Beer posts" />
      </Head>
      <div className="flex items-center justify-center bg-base-100" ref={pageRef}>
        <div className="my-10 flex w-11/12 flex-col space-y-4 lg:w-8/12">
          <header className="my-10 flex justify-between">
            <div className="space-y-2">
              <h1 className="text-6xl font-bold">The Biergarten Index</h1>
            </div>
            {!!user && (
              <div>
                <Link href="/beers/create" className="btn-primary btn">
                  Create a new beer post
                </Link>
              </div>
            )}
          </header>
          <div className="grid gap-6 xl:grid-cols-2 2xl:grid-cols-3">
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
            {isLoadingMore && (
              <>
                {Array.from({ length: PAGE_SIZE }, (_, i) => (
                  <BeerPostLoadingCard key={i} />
                ))}
              </>
            )}
          </div>

          {isLoadingMore && (
            <div className="mt-1 flex h-52 w-full items-center justify-center">
              <Spinner size={isDesktop ? 'lg' : 'md'} />
            </div>
          )}

          {!isLoadingMore && isAtEnd && (
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
    </Layout>
  );
};

export default BeerPage;
