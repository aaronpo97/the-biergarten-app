import UserContext from '@/contexts/userContext';
import { BeerCommentQueryResultArrayT } from '@/services/BeerComment/schema/BeerCommentQueryResult';
import { BeerPostQueryResult } from '@/services/BeerPost/schema/BeerPostQueryResult';
import { useRouter } from 'next/router';
import { FC, useContext } from 'react';
import BeerCommentForm from './BeerCommentForm';
import BeerCommentsPaginationBar from './BeerPostCommentsPaginationBar';
import CommentCard from './CommentCard';

interface BeerPostCommentsSectionProps {
  beerPost: BeerPostQueryResult;
  setComments: React.Dispatch<React.SetStateAction<BeerCommentQueryResultArrayT>>;
  comments: BeerCommentQueryResultArrayT;
  commentsPageCount: number;
}

const BeerPostCommentsSection: FC<BeerPostCommentsSectionProps> = ({
  beerPost,
  setComments,
  comments,
  commentsPageCount,
}) => {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const commentsPageNum = parseInt(router.query.comments_page as string, 10) || 1;

  return (
    <div className="w-full space-y-3 md:w-[60%]">
      <div className="card h-96 bg-base-300">
        <div className="card-body h-full">
          {user ? (
            <BeerCommentForm beerPost={beerPost} setComments={setComments} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <span className="text-lg font-bold">Log in to leave a comment.</span>
            </div>
          )}
        </div>
      </div>
      {comments.length ? (
        <div className="card bg-base-300 pb-6">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} beerPostId={beerPost.id} />
          ))}

          <BeerCommentsPaginationBar
            commentsPageNum={commentsPageNum}
            commentsPageCount={commentsPageCount}
            beerPost={beerPost}
          />
        </div>
      ) : (
        <div className="card items-center bg-base-300">
          <div className="card-body">
            <span className="text-lg font-bold">No comments yet.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeerPostCommentsSection;
