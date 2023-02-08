import Link from 'next/link';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
import format from 'date-fns/format';
import { useContext, useEffect, useState } from 'react';
import { FaRegThumbsUp, FaThumbsUp } from 'react-icons/fa';
import BeerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';
import UserContext from '@/pages/contexts/userContext';
import APIResponseValidationSchema from '@/validation/APIResponseValidationSchema';
import { z } from 'zod';

const BeerInfoHeader: React.FC<{ beerPost: BeerPostQueryResult }> = ({ beerPost }) => {
  const createdAtDate = new Date(beerPost.createdAt);
  const [timeDistance, setTimeDistance] = useState('');
  const { user } = useContext(UserContext);
  useEffect(() => {
    setTimeDistance(formatDistanceStrict(new Date(beerPost.createdAt), new Date()));
  }, [beerPost.createdAt]);

  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetch(`/api/beers/${beerPost.id}/like/is-liked`)
      .then((response) => response.json())
      .then((data) => {
        const parsed = APIResponseValidationSchema.safeParse(data);

        if (!parsed.success) {
          throw new Error('Invalid API response.');
        }
        const { payload } = parsed.data;

        const parsedPayload = z
          .object({
            isLiked: z.boolean(),
          })
          .safeParse(payload);

        if (!parsedPayload.success) {
          throw new Error('Invalid API response payload.');
        }

        const { isLiked: alreadyLiked } = parsedPayload.data;

        setIsLiked(alreadyLiked);
        setLoading(false);
      });
  }, [user, beerPost.id]);

  const handleLike = async () => {
    const response = await fetch(`/api/beers/${beerPost.id}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: '',
    });

    if (!response.ok) {
      throw new Error('Something went wrong.');
    }

    const data = await response.json();

    const parsed = APIResponseValidationSchema.safeParse(data);

    if (!parsed.success) {
      throw new Error('Invalid API response.');
    }

    const { success, message } = parsed.data;

    setIsLiked(!isLiked);
    console.log({ success, message });
  };

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
            {user && (
              <button
                type="button"
                className={`btn gap-2 rounded-2xl ${
                  !isLiked ? 'btn-ghost outline' : 'btn-primary'
                }`}
                onClick={() => {
                  handleLike();
                }}
                disabled={loading}
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeerInfoHeader;
