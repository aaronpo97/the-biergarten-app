import { NextPage } from 'next';
import Layout from '@/components/ui/Layout';
import BeerCard from '@/components/BeerIndex/BeerCard';
import Head from 'next/head';
import Link from 'next/link';
import UserContext from '@/contexts/userContext';
import { MutableRefObject, useContext, useRef } from 'react';

import { useInView } from 'react-intersection-observer';
import Spinner from '@/components/ui/Spinner';

import useBeerPosts from '@/hooks/useBeerPosts';
import BeerPostLoadingCard from '@/components/BeerIndex/BeerPostLoadingCard';
import { FaArrowUp, FaPlus } from 'react-icons/fa';

const BeerPage: NextPage = () => {
  const { user } = useContext(UserContext);

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
    <Layout>
      <Head>
        <title>Beer</title>
        <meta name="description" content="Beer posts" />
      </Head>
      <div className="flex items-center justify-center bg-base-100" ref={pageRef}>
        <div className="my-10 flex w-11/12 flex-col space-y-4 lg:w-8/12 2xl:w-7/12">
          <header className="my-10 flex justify-between lg:flex-row">
            <h1 className="text-6xl font-bold">The Biergarten Index</h1>
            {!!user && (
              <div
                className="tooltip tooltip-left h-full"
                data-tip="Create a new beer post"
              >
                <Link href="/beers/create" className="btn-ghost btn-sm btn">
                  <FaPlus />
                </Link>
              </div>
            )}
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
                  <BeerPostLoadingCard key={i} />
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
    </Layout>
  );
};

export default BeerPage;