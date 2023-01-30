import BeerCommentQueryResult from '@/services/BeerPost/types/BeerCommentQueryResult';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';
// @ts-expect-error
import ReactStars from 'react-rating-stars-component';

const CommentCard: React.FC<{
  comment: BeerCommentQueryResult;
}> = ({ comment }) => {
  const timeDistance = formatDistanceStrict(new Date(comment.createdAt), new Date());
  return (
    <div className="card-body h-56">
      <div className="flex justify-between">
        <div>
          <h3 className="text-2xl font-semibold">{comment.postedBy.username}</h3>
          <h4 className="italic">posted {timeDistance} ago</h4>
        </div>
        <ReactStars
          count={5}
          size={24}
          activeColor="#ffd700"
          edit={false}
          value={comment.rating}
        />
      </div>
      <p>{comment.content}</p>
    </div>
  );
};

export default CommentCard;
