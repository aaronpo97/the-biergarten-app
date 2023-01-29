import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import Link from 'next/link';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import { useState } from 'react';
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';

const BeerInfoHeader: React.FC<{ beerPost: BeerPostQueryResult }> = ({ beerPost }) => {
  const createdAtDate = new Date(beerPost.createdAt);
  const timeDistance = formatDistanceStrict(createdAtDate, Date.now());

  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className="flex h-full flex-col justify-center bg-base-300 p-10">
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
          {beerPost.postedBy.username}
        </Link>
        {` ${timeDistance}`} ago
      </h3>

      <p>{beerPost.description}</p>
      <div className="flex justify-between">
        <div>
          <div className="mb-1">
            <Link
              className="text-lg font-medium"
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
  );
};

export default BeerInfoHeader;
