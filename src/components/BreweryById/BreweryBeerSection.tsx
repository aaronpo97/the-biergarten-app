import UseBeerPostsByBrewery from '@/hooks/useBeerPostsByBrewery';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import Link from 'next/link';
import { FC } from 'react';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';
import BeerRecommendationLoadingComponent from '../BeerById/BeerRecommendationLoadingComponent';

interface BreweryCommentsSectionProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}

const BreweryBeersSection: FC<BreweryCommentsSectionProps> = ({ breweryPost }) => {
  const PAGE_SIZE = 2;
  const { beerPosts, isAtEnd, isLoadingMore, setSize, size } = UseBeerPostsByBrewery({
    breweryId: breweryPost.id,
    pageSize: PAGE_SIZE,
  });
  const { ref: penultimateBeerPostRef } = useInView({
    /**
     * When the last beer post comes into view, call setSize from useBeerPostsByBrewery to
     * load more beer posts.
     */
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });

  return (
    <div className="card">
      <div className="card-body">
        <>
          <h3 className="text-2xl font-bold">Brews</h3>
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
                      <span className="text-lg font-medium">{beerPost.type.name}</span>
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

export default BreweryBeersSection;
