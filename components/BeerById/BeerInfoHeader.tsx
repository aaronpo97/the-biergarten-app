import Link from 'next/link';
import format from 'date-fns/format';
import { FC, useContext } from 'react';

import UserContext from '@/contexts/userContext';
import { FaRegEdit } from 'react-icons/fa';
import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import { z } from 'zod';
import useGetLikeCount from '@/hooks/useGetLikeCount';
import useTimeDistance from '@/hooks/useTimeDistance';
import BeerPostLikeButton from './BeerPostLikeButton';

const BeerInfoHeader: FC<{
  beerPost: z.infer<typeof beerPostQueryResult>;
}> = ({ beerPost }) => {
  const createdAt = new Date(beerPost.createdAt);
  const timeDistance = useTimeDistance(createdAt);

  const { user } = useContext(UserContext);
  const idMatches = user && beerPost.postedBy.id === user.id;
  const isPostOwner = !!(user && idMatches);

  const { likeCount, mutate } = useGetLikeCount(beerPost.id);

  return (
    <main className="card flex flex-col justify-center bg-base-300">
      <article className="card-body">
        <div className="flex justify-between">
          <header>
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
          </header>
          {isPostOwner && (
            <div className="tooltip tooltip-left" data-tip={`Edit '${beerPost.name}'`}>
              <Link
                href={`/beers/${beerPost.id}/edit`}
                className="btn-outline btn-sm btn"
              >
                <FaRegEdit className="text-xl" />
              </Link>
            </div>
          )}
        </div>

        <h3 className="italic">
          {' posted by '}
          <Link href={`/users/${beerPost.postedBy.id}`} className="link-hover link">
            {`${beerPost.postedBy.username} `}
          </Link>
          {timeDistance && (
            <span
              className="tooltip tooltip-right"
              data-tip={format(createdAt, 'MM/dd/yyyy')}
            >
              {`${timeDistance} ago`}
            </span>
          )}
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
              {likeCount && (
                <span>
                  Liked by {likeCount} user{likeCount !== 1 && 's'}
                </span>
              )}
            </div>
          </div>
          <div className="card-actions items-end">
            {user && <BeerPostLikeButton beerPostId={beerPost.id} mutateCount={mutate} />}
          </div>
        </div>
      </article>
    </main>
  );
};

export default BeerInfoHeader;
