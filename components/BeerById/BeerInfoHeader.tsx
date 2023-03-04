import Link from 'next/link';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import format from 'date-fns/format';
import { FC, useContext, useEffect, useState } from 'react';
import { BeerPostQueryResult } from '@/services/BeerPost/schema/BeerPostQueryResult';

import UserContext from '@/contexts/userContext';
import { FaRegEdit } from 'react-icons/fa';
import BeerPostLikeButton from './BeerPostLikeButton';

const BeerInfoHeader: FC<{ beerPost: BeerPostQueryResult; initialLikeCount: number }> = ({
  beerPost,
  initialLikeCount,
}) => {
  const createdAtDate = new Date(beerPost.createdAt);
  const [timeDistance, setTimeDistance] = useState('');
  const { user } = useContext(UserContext);

  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPostOwner, setIsPostOwner] = useState(false);

  useEffect(() => {
    const idMatches = user && beerPost.postedBy.id === user.id;

    if (!(user && idMatches)) {
      setIsPostOwner(false);
      return;
    }

    setIsPostOwner(true);
  }, [user, beerPost]);

  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  useEffect(() => {
    setTimeDistance(formatDistanceStrict(new Date(beerPost.createdAt), new Date()));
  }, [beerPost.createdAt]);

  return (
    <div className="card flex flex-col justify-center bg-base-300">
      <div className="card-body">
        <div className="flex justify-between">
          <div>
            <h1 className="text-4xl font-bold">{beerPost.name}</h1>
            <h2 className="text-2xl font-semibold">
              by{' '}
              <Link
                href={`/breweries/${beerPost.brewery.id}`}
                className="link-hover link text-2xl font-semibold"
              >
                {beerPost.brewery.name}
              </Link>
            </h2>
          </div>
          <div>
            {isPostOwner && (
              <div className="tooltip tooltip-left" data-tip={`Edit '${beerPost.name}'`}>
                <Link
                  href={`/beers/${beerPost.id}/edit`}
                  className="btn btn-outline btn-sm"
                >
                  <FaRegEdit className="text-xl" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <h3 className="italic">
          posted by{' '}
          <Link href={`/users/${beerPost.postedBy.id}`} className="link-hover link">
            {beerPost.postedBy.username}{' '}
          </Link>
          <span
            className="tooltip tooltip-bottom"
            data-tip={format(createdAtDate, 'MM/dd/yyyy')}
          >
            {timeDistance} ago
          </span>
        </h3>

        <p>{beerPost.description}</p>
        <div className="flex justify-between">
          <div className="space-y-1">
            <div>
              <Link
                className="link-hover link text-lg font-bold"
                href={`/beers/types/${beerPost.type.id}`}
              >
                {beerPost.type.name}
              </Link>
            </div>
            <div>
              <span className="mr-4 text-lg font-medium">{beerPost.abv}% ABV</span>
              <span className="text-lg font-medium">{beerPost.ibu} IBU</span>
            </div>
            <div>
              <span>
                Liked by {likeCount} user{likeCount !== 1 && 's'}
              </span>
            </div>
          </div>
          <div className="card-actions items-end">
            {user && (
              <BeerPostLikeButton beerPostId={beerPost.id} setLikeCount={setLikeCount} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeerInfoHeader;
