import Link from 'next/link';
import { FC, MutableRefObject, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';
import useBeerRecommendations from '@/hooks/data-fetching/beer-posts/useBeerRecommendations';
import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import debounce from 'lodash/debounce';
import BeerRecommendationLoadingComponent from './BeerRecommendationLoadingComponent';

const BeerRecommendationsSection: FC<{
  beerPost: z.infer<typeof beerPostQueryResult>;
}> = ({ beerPost }) => {
  const PAGE_SIZE = 10;

  const { beerPosts, isAtEnd, isLoadingMore, setSize, size } = useBeerRecommendations({
    beerPost,
    pageSize: PAGE_SIZE,
  });

  const { ref: penultimateBeerPostRef } = useInView({
    /**
     * When the last beer post comes into view, call setSize from
     * useBeerPostsByBrewery to load more beer posts.
     */
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      debounce(() => setSize(size + 1), 200)();
    },
  });

  const beerRecommendationsRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  return (
    <div className="card h-full" ref={beerRecommendationsRef}>
      <div className="card-body">
        <>
          <div className="my-2 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">Also check out</h3>
            </div>
          </div>

          {!!beerPosts.length && (
            <div className="space-y-5">
              {beerPosts.map((post, index) => {
                const isPenultimateBeerPost = index === beerPosts.length - 2;

                /**
                 * Attach a ref to the second last beer post in the list.
                 * When it comes into view, the component will call
                 * setSize to load more beer posts.
                 */

                return (
                  <div
                    ref={isPenultimateBeerPost ? penultimateBeerPostRef : undefined}
                    key={post.id}
                  >
                    <div className="flex flex-col">
                      <Link className="link-hover link" href={`/beers/${post.id}`}>
                        <span className="text-xl font-semibold">{post.name}</span>
                      </Link>

                      <Link
                        className="link-hover link"
                        href={`/breweries/${post.brewery.id}`}
                      >
                        <span className="text-lg font-semibold">{post.brewery.name}</span>
                      </Link>
                    </div>

                    <div>
                      <div>
                        <span className="text-lg font-medium">{post.type.name}</span>
                      </div>
                      <div className="space-x-2">
                        <span>{post.abv}% ABV</span>
                        <span>{post.ibu} IBU</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {
            /**
             * If there are more beer posts to load, show a loading component
             * with a skeleton loader and a loading spinner.
             */
            !!isLoadingMore && !isAtEnd && (
              <BeerRecommendationLoadingComponent length={PAGE_SIZE} />
            )
          }
        </>
      </div>
    </div>
  );
};

export default BeerRecommendationsSection;
