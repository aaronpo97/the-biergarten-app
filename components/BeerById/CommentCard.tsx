import BeerPostQueryResult from '@/services/BeerPost/types/BeerPostQueryResult';
import formatDistanceStrict from 'date-fns/formatDistanceStrict';

const CommentCard: React.FC<{
  comment: BeerPostQueryResult['beerComments'][number];
}> = ({ comment }) => {
  return (
    <div className="card bg-base-300">
      <div className="card-body">
        <h3 className="text-2xl font-semibold">{comment.postedBy.username}</h3>
        <h4 className="italic">{`posted ${formatDistanceStrict(
          new Date(comment.createdAt),
          new Date(),
        )} ago`}</h4>
        <p>{comment.content}</p>
      </div>
    </div>
  );
};

export default CommentCard;
