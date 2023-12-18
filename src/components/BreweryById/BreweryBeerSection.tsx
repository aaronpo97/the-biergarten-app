import UseBeerPostsByBrewery from '@/hooks/data-fetching/beer-posts/useBeerPostsByBrewery';
import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import Link from 'next/link';
import { FC, MutableRefObject, useContext, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';
import { FaPlus } from 'react-icons/fa';
import UserContext from '@/contexts/UserContext';
import BeerRecommendationLoadingComponent from '../BeerById/BeerRecommendationLoadingComponent';

interface BreweryCommentsSectionProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}

const BreweryBeersSection: FC<BreweryCommentsSectionProps> = ({ breweryPost }) => {
  const PAGE_SIZE = 2;
  const { user } = useContext(UserContext);

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

  const beerRecommendationsRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  return (
    <div className="card h-full" ref={beerRecommendationsRef}>
      <div className="card-body">
        <>
          <div className="my-2 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-3xl font-bold">Brews</h3>
            </div>
            <div>
              {user && (
                <Link
                  className={`btn btn-ghost btn-sm gap-2 rounded-2xl outline`}
                  href={`/breweries/${breweryPost.id}/beers/create`}
                >
                  <FaPlus className="text-xl" />
                  Add Beer
                </Link>
              )}
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
                        className="link-hover link text-lg font-medium"
                        href={`/beers/styles/${beerPost.style.id}`}
                      >
                        {beerPost.style.name}
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

export default BreweryBeersSection;
