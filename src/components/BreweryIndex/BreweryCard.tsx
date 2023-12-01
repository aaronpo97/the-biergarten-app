import UserContext from '@/contexts/UserContext';
import useGetBreweryPostLikeCount from '@/hooks/data-fetching/brewery-likes/useGetBreweryPostLikeCount';
import BreweryPostQueryResult from '@/services/BreweryPost/schema/BreweryPostQueryResult';
import { FC, useContext } from 'react';
import Link from 'next/link';
import { z } from 'zod';

import { CldImage } from 'next-cloudinary';
import BreweryPostLikeButton from './BreweryPostLikeButton';

const BreweryCard: FC<{ brewery: z.infer<typeof BreweryPostQueryResult> }> = ({
  brewery,
}) => {
  const { user } = useContext(UserContext);
  const { likeCount, mutate, isLoading } = useGetBreweryPostLikeCount(brewery.id);
  return (
    <div className="card" key={brewery.id}>
      <figure className="card-image h-96">
        <Link href={`/breweries/${brewery.id}`} className="h-full object-cover">
          {brewery.breweryImages.length > 0 && (
            <CldImage
              src={brewery.breweryImages[0].path}
              alt={brewery.name}
              width="1029"
              height="110"
              crop="fill"
              className="h-full object-cover"
            />
          )}
        </Link>
      </figure>
      <div className="card-body justify-between">
        <div>
          <Link href={`/breweries/${brewery.id}`} className="link-hover link">
            <h2 className="text-xl truncate font-bold lg:text-2xl">{brewery.name}</h2>
          </Link>
        </div>
        <div className="flex items-end justify-between">
          <div className="w-9/12">
            <h3 className="text-lg font-semibold lg:text-xl truncate">
              {brewery.location.city},{' '}
              {brewery.location.stateOrProvince || brewery.location.country}
            </h3>
            <h4 className="text-lg font-semibold lg:text-xl">
              est. {brewery.dateEstablished.getFullYear()}
            </h4>
            <div className="mt-2">
              {!isLoading && <span>liked by {likeCount} users</span>}
            </div>
          </div>
          <div>
            {!!user && !isLoading && (
              <BreweryPostLikeButton breweryPostId={brewery.id} mutateCount={mutate} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreweryCard;
