import UserContext from '@/contexts/userContext';
import { BeerCommentQueryResultT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import { format, formatDistanceStrict } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { Rating } from 'react-daisyui';

import { FaEllipsisH } from 'react-icons/fa';

const CommentCardDropdown: React.FC<{
  comment: BeerCommentQueryResultT;
  beerPostId: string;
}> = ({ comment, beerPostId }) => {
  const router = useRouter();
  const { user } = useContext(UserContext);

  const isCommentOwner = user?.id === comment.postedBy.id;

  const handleDelete = async () => {
    const response = await fetch(`/api/beer-comments/${comment.id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }

    router.replace(`/beers/${beerPostId}?comments_page=1`, undefined, { scroll: false });
  };

  return (
    <div className="dropdown">
      <label tabIndex={0} className="btn btn-ghost btn-sm m-1">
        <FaEllipsisH />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box w-52 bg-base-100 p-2 shadow"
      >
        {isCommentOwner ? (
          <li>
            <button onClick={handleDelete}>Delete</button>
          </li>
        ) : (
          <li>
            <button>Report</button>
          </li>
        )}
      </ul>
    </div>
  );
};

const CommentCard: React.FC<{
  comment: BeerCommentQueryResultT;
  beerPostId: string;
}> = ({ comment, beerPostId }) => {
  const [timeDistance, setTimeDistance] = useState('');
  const { user } = useContext(UserContext);

  useEffect(() => {
    setTimeDistance(formatDistanceStrict(new Date(comment.createdAt), new Date()));
  }, [comment.createdAt]);

  return (
    <div className="card-body">
      <div className="flex flex-col justify-between sm:flex-row">
        <div>
          <h3 className="font-semibold sm:text-2xl">
            <Link href={`/users/${comment.postedBy.id}`} className="link-hover link">
              {comment.postedBy.username}
            </Link>
          </h3>
          <h4 className="italic">
            posted{' '}
            <time
              className="tooltip tooltip-bottom"
              data-tip={format(new Date(comment.createdAt), 'MM/dd/yyyy')}
            >
              {timeDistance}
            </time>{' '}
            ago
          </h4>
        </div>

        {user && <CommentCardDropdown comment={comment} beerPostId={beerPostId} />}
      </div>

      <div className="space-y-1">
        <Rating value={comment.rating}>
          {Array.from({ length: 5 }).map((val, index) => (
            <Rating.Item
              name="rating-1"
              className="mask mask-star cursor-default"
              disabled
              aria-disabled
              key={index}
            />
          ))}
        </Rating>
        <p>{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentCard;
