import Link from 'next/link';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import format from 'date-fns/format';
import { useEffect, useState } from 'react';
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';

const BeerInfoHeader: React.FC<{ beerPost: BeerPostQueryResult }> = ({ beerPost }) => {
  const createdAtDate = new Date(beerPost.createdAt);
  const [timeDistance, setTimeDistance] = useState('');

  useEffect(() => {
    setTimeDistance(formatDistanceStrict(new Date(beerPost.createdAt), new Date()));
  }, [beerPost.createdAt]);

  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="card flex flex-col justify-center bg-base-300">
      <div className="card-body">
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
        <div className="mt-5 flex justify-between">
          <div>
            <div className="mb-1">
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
          </div>
          <div className="card-actions">
            <button
              type="button"
              className={`btn gap-2 rounded-2xl ${
                !isLiked ? 'btn-ghost outline' : 'btn-primary'
              }`}
              onClick={() => {
                setIsLiked(!isLiked);
              }}
            >
              {isLiked ? (
                <>
                  <FaThumbsUp className="text-2xl" />
                  <span>Liked</span>
                </>
              ) : (
                <>
                  <FaRegThumbsUp className="text-2xl" />
                  <span>Like</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeerInfoHeader;