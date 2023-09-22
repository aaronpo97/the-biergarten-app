import Link from 'next/link';
import format from 'date-fns/format';
import { FC, useContext } from 'react';

import UserContext from '@/contexts/UserContext';
import { FaRegEdit } from 'react-icons/fa';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';
import useGetBeerPostLikeCount from '@/hooks/data-fetching/beer-likes/useBeerPostLikeCount';
import useTimeDistance from '@/hooks/utilities/useTimeDistance';
import BeerPostLikeButton from './BeerPostLikeButton';

interface BeerInfoHeaderProps {
  beerPost: z.infer<typeof BeerPostQueryResult>;
}

const BeerInfoHeader: FC<BeerInfoHeaderProps> = ({ beerPost }) => {
  const createdAt = new Date(beerPost.createdAt);
  const timeDistance = useTimeDistance(createdAt);

  const { user } = useContext(UserContext);
  const idMatches = user && beerPost.postedBy.id === user.id;
  const isPostOwner = !!(user && idMatches);

  const { likeCount, mutate } = useGetBeerPostLikeCount(beerPost.id);

  return (
    <article className="card flex flex-col justify-center bg-base-300">
      <div className="card-body">
        <header className="flex justify-between">
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold lg:text-4xl">{beerPost.name}</h1>
              <h2 className="text-lg font-semibold lg:text-2xl">
                by{' '}
                <Link
                  href={`/breweries/${beerPost.brewery.id}`}
                  className="link-hover link font-semibold"
                >
                  {beerPost.brewery.name}
                </Link>
              </h2>
            </div>
            <div>
              <h3 className="italic">
                {' posted by '}
                <Link href={`/users/${beerPost.postedBy.id}`} className="link-hover link">
                  {`${beerPost.postedBy.username} `}
                </Link>
                {timeDistance && (
                  <span
                    className="tooltip tooltip-bottom"
                    data-tip={format(createdAt, 'MM/dd/yyyy')}
                  >
                    {`${timeDistance} ago`}
                  </span>
                )}
              </h3>
            </div>
          </div>

          {isPostOwner && (
            <div className="tooltip tooltip-left" data-tip={`Edit '${beerPost.name}'`}>
              <Link href={`/beers/${beerPost.id}/edit`} className="btn-ghost btn-xs btn">
                <FaRegEdit className="text-xl" />
              </Link>
            </div>
          )}
        </header>
        <div className="space-y-2">
          <p>{beerPost.description}</p>
          <div className="flex justify-between">
            <div className="space-y-1">
              <div>
                <Link
                  className="link-hover link text-lg font-bold"
                  href={`/beers/types/${beerPost.style.id}`}
                >
                  {beerPost.style.name}
                </Link>
              </div>
              <div>
                <span className="mr-4 text-lg font-medium">
                  {beerPost.abv.toFixed(1)}% ABV
                </span>
                <span className="text-lg font-medium">{beerPost.ibu.toFixed(1)} IBU</span>
              </div>
              <div>
                {(!!likeCount || likeCount === 0) && (
                  <span>
                    Liked by {likeCount}
                    {likeCount !== 1 ? ' users' : ' user'}
                  </span>
                )}
              </div>
            </div>
            <div className="card-actions items-end">
              {user && (
                <BeerPostLikeButton beerPostId={beerPost.id} mutateCount={mutate} />
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BeerInfoHeader;
