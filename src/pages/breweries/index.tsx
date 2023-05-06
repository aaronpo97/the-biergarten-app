import BreweryCard from '@/components/BreweryIndex/BreweryCard';
import LoadingCard from '@/components/ui/LoadingCard';
import Spinner from '@/components/ui/Spinner';
import UserContext from '@/contexts/userContext';
import useBreweryPosts from '@/hooks/data-fetching/brewery-posts/useBreweryPosts';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { NextPage } from 'next';
import Head from 'next/head';
import { useContext, MutableRefObject, useRef } from 'react';
import Link from 'next/link';
import { FaPlus, FaArrowUp } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';

interface BreweryPageProps {
  breweryPosts: z.infer<typeof BreweryPostQueryResult>[];
}

const BreweryPage: NextPage<BreweryPageProps> = () => {
  const PAGE_SIZE = 6;

  const { breweryPosts, setSize, size, isLoading, isLoadingMore, isAtEnd } =
    useBreweryPosts({
      pageSize: PAGE_SIZE,
    });

  const { ref: lastBreweryPostRef } = useInView({
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });

  const { user } = useContext(UserContext);

  const pageRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  return (
    <>
      <Head>
        <title>Breweries</title>
        <meta
          name="description"
          content="Find breweries near you and around the world."
        />
      </Head>
      <div className="flex items-center justify-center bg-base-100" ref={pageRef}>
        <div className="my-10 flex w-10/12 flex-col space-y-4 lg:w-8/12 2xl:w-7/12">
          <header className="my-10 flex justify-between lg:flex-row">
            <div className="space-y-2">
              <div>
                <h1 className="text-4xl font-bold lg:text-6xl">The Biergarten App</h1>
                <h2 className="text-2xl font-bold lg:text-4xl">Breweries</h2>
              </div>
              <div>
                <Link
                  className="link-hover link text-xl font-bold lg:text-2xl"
                  href="/breweries/map"
                >
                  View map
                </Link>
              </div>
            </div>
            {!!user && (
              <div
                className="tooltip tooltip-left h-full"
                data-tip="Create a new brewery post"
              >
                <Link href="/breweries/create" className="btn-ghost btn-sm btn">
                  <FaPlus />
                </Link>
              </div>
            )}
          </header>
          <div className="grid gap-6 xl:grid-cols-2">
            {!!breweryPosts.length && !isLoading && (
              <>
                {breweryPosts.map((breweryPost) => {
                  return (
                    <div
                      key={breweryPost.id}
                      ref={
                        breweryPosts[breweryPosts.length - 1] === breweryPost
                          ? lastBreweryPostRef
                          : undefined
                      }
                    >
                      <BreweryCard brewery={breweryPost} />
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
                      block: 'start',
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

export default BreweryPage;
