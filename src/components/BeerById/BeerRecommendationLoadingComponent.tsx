import { FC } from 'react';
import Spinner from '../ui/Spinner';

interface BeerRecommendationLoadingComponentProps {
  length: number;
}

const BeerRecommendationLoadingComponent: FC<BeerRecommendationLoadingComponentProps> = ({
  length,
}) => {
  return (
    <>
      {Array.from({ length }).map((_, i) => (
        <div className="animate my-3 fade-in-10" key={i}>
          <div className="flex animate-pulse space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 w-3/4 rounded bg-base-100" />
              <div className="space-y-2">
                <div className="h-4 rounded bg-base-100" />
                <div className="h-4 w-11/12 rounded bg-base-100" />
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="p-1">
        <Spinner size="sm" />
      </div>
    </>
  );
};

export default BeerRecommendationLoadingComponent;
