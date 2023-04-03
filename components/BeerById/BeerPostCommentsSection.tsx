/* eslint-disable no-nested-ternary */
import UserContext from '@/contexts/userContext';

import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';

import { FC, useContext } from 'react';
import { z } from 'zod';
import useBeerPostComments from '@/hooks/useBeerPostComments';
import { useRouter } from 'next/router';
import BeerCommentForm from './BeerCommentForm';
import BeerCommentsPaginationBar from './BeerPostCommentsPaginationBar';
import CommentCard from './CommentCard';

interface BeerPostCommentsSectionProps {
  beerPost: z.infer<typeof beerPostQueryResult>;
}

const CommentLoadingCard = () => {
  return (
    <div className="card-body h-64">
      <div className="flex animate-pulse space-x-4">
        <div className="flex-1 space-y-4 py-1">
          <div className="h-4 w-3/4 rounded bg-gray-400" />
          <div className="space-y-2">
            <div className="h-4 rounded bg-gray-400" />
            <div className="h-4 w-5/6 rounded bg-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

const NoCommentsCard = () => {
  return (
    <div className="card bg-base-300">
      <div className="card-body h-64">
        <div className="flex h-full flex-col items-center justify-center">
          <span className="text-lg font-bold">No comments yet.</span>
        </div>
      </div>
    </div>
  );
};

const BeerPostCommentsSection: FC<BeerPostCommentsSectionProps> = ({ beerPost }) => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const commentsPageNum = parseInt(router.query.comments_page as string, 10) || 1;

  const { comments, commentsPageCount, isLoading, mutate } = useBeerPostComments({
    id: beerPost.id,
    pageNum: commentsPageNum,
    pageSize: 5,
  });
  return (
    <div className="w-full space-y-3 md:w-[60%]">
      <div className="card h-96 bg-base-300">
        <div className="card-body h-full">
          {user ? (
            <BeerCommentForm beerPost={beerPost} mutate={mutate} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <span className="text-lg font-bold">Log in to leave a comment.</span>
            </div>
          )}
        </div>
      </div>

      {comments && !!commentsPageCount && !isLoading && (
        <div className="card bg-base-300 pb-6">
          {comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} mutate={mutate} />
          ))}

          <BeerCommentsPaginationBar
            commentsPageNum={commentsPageNum}
            commentsPageCount={commentsPageCount}
            beerPost={beerPost}
          />
        </div>
      )}

      {!comments?.length && !isLoading && <NoCommentsCard />}

      {isLoading && (
        <div className="card bg-base-300">
          {Array.from({ length: 5 }).map((_, i) => (
            <CommentLoadingCard key={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BeerPostCommentsSection;
