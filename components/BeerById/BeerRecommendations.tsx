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
    <div className="card sticky top-2 h-full overflow-y-scroll bg-base-300">
      <div className="card-body">
        {beerRecommendations.map((beerPost) => (
          <div key={beerPost.id} className="w-full">
            <div>
              <Link
                className="link-hover"
                href={`/beers/${beerPost.id}`}
                scroll={false}
              >
                <h2 className="text-2xl font-bold">{beerPost.name}</h2>
              </Link>
              <Link
                href={`/breweries/${beerPost.brewery.id}`}
                className="link-hover"
              >
                <p className="text-lg font-semibold">{beerPost.brewery.name}</p>
              </Link>
            </div>

            <p>{beerPost.abv}% ABV</p>
            <p>{beerPost.ibu} IBU</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BeerRecommendations;
