import { BeerCommentQueryResultT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import { formatDistanceStrict } from 'date-fns';
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
    <div className="card-body h-[1/9]">
      <div className="flex justify-between">
        <div>
          <h3 className="text-2xl font-semibold">{comment.postedBy.username}</h3>
          <h4 className="italic">posted {timeDistance} ago</h4>
        </div>
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
      <p>{comment.content}</p>
    </div>
  );
};

export default CommentCard;
