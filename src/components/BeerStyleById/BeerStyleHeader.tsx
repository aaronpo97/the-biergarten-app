import Link from 'next/link';
import format from 'date-fns/format';
import { FC, useContext } from 'react';

import UserContext from '@/contexts/UserContext';
import { FaRegEdit } from 'react-icons/fa';

import { z } from 'zod';
import useTimeDistance from '@/hooks/utilities/useTimeDistance';
import BeerStyleQueryResult from '@/services/BeerStyles/schema/BeerStyleQueryResult';

interface BeerInfoHeaderProps {
  beerStyle: z.infer<typeof BeerStyleQueryResult>;
}

const BeerStyleHeader: FC<BeerInfoHeaderProps> = ({ beerStyle }) => {
  const createdAt = new Date(beerStyle.createdAt);
  const timeDistance = useTimeDistance(createdAt);

  const { user } = useContext(UserContext);
  const idMatches = user && beerStyle.postedBy.id === user.id;
  const isPostOwner = !!(user && idMatches);

  // const { likeCount, mutate } = useBeerStyleLikeCount(beerStyle.id);

  return (
    <article className="card flex flex-col justify-center bg-base-300">
      <div className="card-body">
        <header className="flex justify-between">
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold lg:text-4xl">{beerStyle.name}</h1>
            </div>
            <div>
              <h3 className="italic">
                {' posted by '}
                <Link
                  href={`/users/${beerStyle.postedBy.id}`}
                  className="link-hover link"
                >
                  {`${beerStyle.postedBy.username} `}
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
            <div className="tooltip tooltip-left" data-tip={`Edit '${beerStyle.name}'`}>
              <Link href={`/beers/${beerStyle.id}/edit`} className="btn-ghost btn-xs btn">
                <FaRegEdit className="text-xl" />
              </Link>
            </div>
          )}
        </header>
        <div className="space-y-2">
          <p>{beerStyle.description}</p>
          <div className="flex w-25 space-x-3 flex-row">
            <div className="text-sm font-bold">
              ABV Range:{' '}
              <span>
                {beerStyle.abvRange[0].toFixed(1)}% - {beerStyle.abvRange[0].toFixed(1)}%
              </span>
            </div>
            <div className="text-sm font-bold">
              IBU Range:{' '}
              <span>
                {beerStyle.ibuRange[0].toFixed(1)} - {beerStyle.ibuRange[1].toFixed(1)}
              </span>
            </div>
          </div>

          <div className="font-semibold">
            Recommended Glassware:{' '}
            <span className="text-sm font-bold italic">{beerStyle.glassware.name}</span>
          </div>
          <div className="flex justify-between">
            <div className="card-actions items-end">
              {/* {user && (
                <BeerStyleLikeButton
                  beerStyle={beerStyle}
                  likeCount={likeCount}
                  mutate={mutate}
                />
              )} */}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BeerStyleHeader;
