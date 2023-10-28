import UserContext from '@/contexts/UserContext';
import useTimeDistance from '@/hooks/utilities/useTimeDistance';
import { format } from 'date-fns';
import { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Rating } from 'react-daisyui';
import Link from 'next/link';
import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';

import { z } from 'zod';
import CommentCardDropdown from './CommentCardDropdown';

interface CommentContentBodyProps {
  comment: z.infer<typeof CommentQueryResult>;
  setInEditMode: Dispatch<SetStateAction<boolean>>;
}

const CommentContentBody: FC<CommentContentBodyProps> = ({ comment, setInEditMode }) => {
  const { user } = useContext(UserContext);
  const timeDistance = useTimeDistance(new Date(comment.createdAt));

  return (
    <div className="card-body animate-in fade-in-10">
      <div className="flex flex-row justify-between">
        <div>
          <p className="font-semibold sm:text-2xl">
            <Link href={`/users/${comment.postedBy.id}`} className="link-hover link">
              {comment.postedBy.username}
            </Link>
          </p>
          <span className="italic">
            posted{' '}
            <time
              className="tooltip tooltip-bottom"
              data-tip={format(new Date(comment.createdAt), 'MM/dd/yyyy')}
            >
              {timeDistance}
            </time>{' '}
            ago
          </span>
        </div>

        {user && <CommentCardDropdown comment={comment} setInEditMode={setInEditMode} />}
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

export default CommentContentBody;
