import BeerRecommendationQueryResult from '@/services/BeerPost/schema/BeerRecommendationQueryResult';
import Link from 'next/link';
import { FunctionComponent } from 'react';

interface BeerRecommendationsProps {
  beerRecommendations: BeerRecommendationQueryResult[];
}
const BeerRecommendations: FunctionComponent<BeerRecommendationsProps> = ({
  beerRecommendations,
}) => {
  return (
    <div className="card sticky top-2 h-full overflow-y-scroll">
      <div className="card-body space-y-3">
        {beerRecommendations.map((beerPost) => (
          <div key={beerPost.id} className="w-full">
            <div>
              <Link className="link-hover" href={`/beers/${beerPost.id}`} scroll={false}>
                <h2 className="truncate text-lg font-bold lg:text-2xl">
                  {beerPost.name}
                </h2>
              </Link>
              <Link href={`/breweries/${beerPost.brewery.id}`} className="link-hover">
                <p className="text-md truncate font-semibold lg:text-xl">
                  {beerPost.brewery.name}
                </p>
              </Link>
            </div>

            <div className="space-x-3 text-sm lg:text-lg">
              <span>{beerPost.abv}% ABV</span>
              <span>{beerPost.ibu} IBU</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BeerRecommendations;
