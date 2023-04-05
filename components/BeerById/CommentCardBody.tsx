import UserContext from '@/contexts/userContext';
import useTimeDistance from '@/hooks/useTimeDistance';
import BeerCommentQueryResult from '@/services/BeerComment/schema/BeerCommentQueryResult';
import format from 'date-fns/format';
import Link from 'next/link';
import { useContext } from 'react';
import { Rating } from 'react-daisyui';

import { FaEllipsisH } from 'react-icons/fa';
import { KeyedMutator } from 'swr';
import { z } from 'zod';

const CommentCardDropdown: React.FC<{
  comment: z.infer<typeof BeerCommentQueryResult>;
  mutate: KeyedMutator<{
    comments: z.infer<typeof BeerCommentQueryResult>[];
    pageCount: number;
  }>;
}> = ({ comment, mutate }) => {
  const { user } = useContext(UserContext);

  const isCommentOwner = user?.id === comment.postedBy.id;

  const handleDelete = async () => {
    const response = await fetch(`/api/beer-comments/${comment.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }

    await mutate();
  };

  return (
    <div className="dropdown">
      <label tabIndex={0} className="btn-ghost btn-sm btn m-1">
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

const CommentCardBody: React.FC<{
  comment: z.infer<typeof BeerCommentQueryResult>;

  mutate: KeyedMutator<{
    comments: z.infer<typeof BeerCommentQueryResult>[];
    pageCount: number;
  }>;
}> = ({ comment, mutate }) => {
  const { user } = useContext(UserContext);

  const timeDistance = useTimeDistance(new Date(comment.createdAt));

  return (
    <div className="card-body h-64 animate-in fade-in-10">
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

        {user && <CommentCardDropdown comment={comment} mutate={mutate} />}
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

export default CommentCardBody;
