import Link from 'next/link';
import { FC, MutableRefObject, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';

import BeerStyleQueryResult from '@/services/posts/BeerStyles/schema/BeerStyleQueryResult';
import useBeerPostsByBeerStyle from '@/hooks/data-fetching/beer-posts/useBeerPostsByBeerStyles';
import BeerRecommendationLoadingComponent from '../BeerById/BeerRecommendationLoadingComponent';

interface BeerStyleBeerSectionProps {
  beerStyle: z.infer<typeof BeerStyleQueryResult>;
}

const BeerStyleBeerSection: FC<BeerStyleBeerSectionProps> = ({ beerStyle }) => {
  const PAGE_SIZE = 2;

  const { beerPosts, isAtEnd, isLoadingMore, setSize, size } = useBeerPostsByBeerStyle({
    beerStyleId: beerStyle.id,
    pageSize: PAGE_SIZE,
  });
  const { ref: penultimateBeerPostRef } = useInView({
    /**
     * When the last beer post comes into view, call setSize from useBeerPostsByBeerStyle
     * to load more beer posts.
     */
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });

  const beerRecommendationsRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  return (
    <div className="card h-full" ref={beerRecommendationsRef}>
      <div className="card-body">
        <>
          <div className="my-2 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">Brews</h3>
            </div>
          </div>

          {!!beerPosts.length && (
            <div className="space-y-5">
              {beerPosts.map((beerPost, index) => {
                const isPenultimateBeerPost = index === beerPosts.length - 2;

                /**
                 * Attach a ref to the second last beer post in the list. When it comes
                 * into view, the component will call setSize to load more beer posts.
                 */

                return (
                  <div
                    ref={isPenultimateBeerPost ? penultimateBeerPostRef : undefined}
                    key={beerPost.id}
                  >
                    <div>
                      <Link className="link-hover link" href={`/beers/${beerPost.id}`}>
                        <span className="text-xl font-semibold">{beerPost.name}</span>
                      </Link>
                    </div>
                    <div>
                      <Link
                        className="link-hover link"
                        href={`/breweries/${beerPost.brewery.id}`}
                      >
                        <span className="text-xl font-semibold">
                          {beerPost.brewery.name}
                        </span>
                      </Link>
                    </div>

                    <div className="space-x-2">
                      <span>{beerPost.abv}% ABV</span>
                      <span>{beerPost.ibu} IBU</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {
            /**
             * If there are more beer posts to load, show a loading component with a
             * skeleton loader and a loading spinner.
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

export default BeerStyleBeerSection;
