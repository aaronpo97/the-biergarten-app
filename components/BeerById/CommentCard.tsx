import { BeerCommentQueryResultT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import { format, formatDistanceStrict } from 'date-fns';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Rating } from 'react-daisyui';

const CommentCard: React.FC<{
  comment: BeerCommentQueryResultT;
}> = ({ comment }) => {
  const [timeDistance, setTimeDistance] = useState('');

  useEffect(() => {
    setTimeDistance(formatDistanceStrict(new Date(comment.createdAt), new Date()));
  }, [comment.createdAt]);

  return (
    <div className="card-body sm:h-64">
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
        <div>
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
        </div>
      </div>
      <p>{comment.content}</p>
    </div>
  );
};

export default CommentCard;
