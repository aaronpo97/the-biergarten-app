import UserContext from '@/contexts/userContext';
import useGetBreweryPostLikeCount from '@/hooks/useGetBreweryPostLikeCount';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { FC, useContext } from 'react';
import Link from 'next/link';
import { z } from 'zod';
import Image from 'next/image';
import BreweryPostLikeButton from './BreweryPostLikeButton';

const BreweryCard: FC<{ brewery: z.infer<typeof BreweryPostQueryResult> }> = ({
  brewery,
}) => {
  const { user } = useContext(UserContext);
  const { likeCount, mutate } = useGetBreweryPostLikeCount(brewery.id);
  return (
    <div className="card" key={brewery.id}>
      <figure className="card-image h-96">
        {brewery.breweryImages.length > 0 && (
          <Image
            src={brewery.breweryImages[0].path}
            alt={brewery.name}
            width="1029"
            height="110"
          />
        )}
      </figure>
      <div className="card-body">
        <div>
          <h2 className="mb-2 text-2xl font-bold lg:text-3xl">
            <Link href={`/breweries/${brewery.id}`} className="link-hover link">
              {brewery.name}
            </Link>
          </h2>
          <h3 className="text-xl font-normal lg:text-2xl">
            located in {brewery.location}
          </h3>
          <h4 className="text-lg lg:text-xl">
            est. {brewery.dateEstablished.getFullYear()}
          </h4>
        </div>
        <div className="flex justify-between">
          <span>liked by {likeCount} users</span>
          {user && (
            <BreweryPostLikeButton breweryPostId={brewery.id} mutateCount={mutate} />
          )}
        </div>
      </div>
    </div>
  );
};

export default BreweryCard;
