import UserContext from '@/contexts/userContext';
import useGetBreweryPostLikeCount from '@/hooks/data-fetching/brewery-likes/useGetBreweryPostLikeCount';
import useTimeDistance from '@/hooks/utilities/useTimeDistance';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { format } from 'date-fns';
import { FC, useContext } from 'react';
import { Link } from 'react-daisyui';
import { FaRegEdit } from 'react-icons/fa';
import { z } from 'zod';
import BreweryPostLikeButton from '../BreweryIndex/BreweryPostLikeButton';

interface BreweryInfoHeaderProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}
const BreweryInfoHeader: FC<BreweryInfoHeaderProps> = ({ breweryPost }) => {
  const createdAt = new Date(breweryPost.createdAt);
  const timeDistance = useTimeDistance(createdAt);

  const { user } = useContext(UserContext);
  const idMatches = user && breweryPost.postedBy.id === user.id;
  const isPostOwner = !!(user && idMatches);

  const { likeCount, mutate } = useGetBreweryPostLikeCount(breweryPost.id);

  return (
    <article className="card flex flex-col justify-center bg-base-300">
      <div className="card-body">
        <header className="flex justify-between">
          <div className="space-y-2">
            <div>
              <h1 className="text-2xl font-bold lg:text-4xl">{breweryPost.name}</h1>
              <h2 className="text-lg font-semibold lg:text-2xl">
                Located in
                {` ${breweryPost.location.city}, ${
                  breweryPost.location.stateOrProvince || breweryPost.location.country
                }`}
              </h2>
            </div>
            <div>
              <h3 className="italic">
                {' posted by '}
                <Link
                  href={`/users/${breweryPost.postedBy.id}`}
                  className="link-hover link"
                >
                  {`${breweryPost.postedBy.username} `}
                </Link>
                {timeDistance && (
                  <span
                    className="tooltip tooltip-bottom"
                    data-tip={format(createdAt, 'MM/dd/yyyy')}
                  >{`${timeDistance} ago`}</span>
                )}
              </h3>
            </div>
          </div>
          {isPostOwner && (
            <div className="tooltip tooltip-left" data-tip={`Edit '${breweryPost.name}'`}>
              <Link
                href={`/breweries/${breweryPost.id}/edit`}
                className="btn-ghost btn-xs btn"
              >
                <FaRegEdit className="text-xl" />
              </Link>
            </div>
          )}
        </header>
        <div className="space-y-2">
          <p>{breweryPost.description}</p>
          <div className="flex items-end justify-between">
            <div className="space-y-1">
              <div>
                {(!!likeCount || likeCount === 0) && (
                  <span>
                    Liked by {likeCount} user{likeCount !== 1 && 's'}
                  </span>
                )}
              </div>
            </div>
            <div className="card-actions">
              {user && (
                <BreweryPostLikeButton
                  breweryPostId={breweryPost.id}
                  mutateCount={mutate}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BreweryInfoHeader;
