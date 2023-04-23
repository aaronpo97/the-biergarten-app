import UserContext from '@/contexts/userContext';
import useGetBreweryPostLikeCount from '@/hooks/useGetBreweryPostLikeCount';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { FC, useContext } from 'react';
import { Link } from 'react-daisyui';
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
      <div className="card-body space-y-3">
        <div>
          <h2 className="text-3xl font-bold">
            <Link href={`/breweries/${brewery.id}`}>{brewery.name}</Link>
          </h2>
          <h3 className="text-xl font-semibold">{brewery.location}</h3>
        </div>
        liked by {likeCount} users
        {user && (
          <BreweryPostLikeButton breweryPostId={brewery.id} mutateCount={mutate} />
        )}
      </div>
    </div>
  );
};

export default BreweryCard;
