/* eslint-disable no-nested-ternary */
import UserContext from '@/contexts/userContext';

import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';

import { FC, useContext } from 'react';
import { z } from 'zod';
import useBeerPostComments from '@/hooks/useBeerPostComments';
import { useRouter } from 'next/router';
import BeerCommentForm from './BeerCommentForm';
import BeerCommentsPaginationBar from './BeerPostCommentsPaginationBar';
import CommentCardBody from './CommentCardBody';
import NoCommentsCard from './NoCommentsCard';
import CommentLoadingCardBody from './CommentLoadingCardBody';

interface BeerPostCommentsSectionProps {
  beerPost: z.infer<typeof beerPostQueryResult>;
}

const BeerPostCommentsSection: FC<BeerPostCommentsSectionProps> = ({ beerPost }) => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const { id } = beerPost;
  const pageNum = parseInt(router.query.comments_page as string, 10) || 1;
  const pageSize = 5;

  const { comments, commentsPageCount, isLoading, mutate } = useBeerPostComments({
    id,
    pageNum,
    pageSize,
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
            <CommentCardBody key={comment.id} comment={comment} mutate={mutate} />
          ))}

          <BeerCommentsPaginationBar
            commentsPageNum={pageNum}
            commentsPageCount={commentsPageCount}
            beerPost={beerPost}
          />
        </div>
      )}

      {!comments?.length && !isLoading && <NoCommentsCard />}

      {isLoading && (
        <div className="card bg-base-300">
          {Array.from({ length: 5 }).map((_, i) => (
            <CommentLoadingCardBody key={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BeerPostCommentsSection;
