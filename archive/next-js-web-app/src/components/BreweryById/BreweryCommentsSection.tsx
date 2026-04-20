import UserContext from '@/contexts/UserContext';
import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import { FC, MutableRefObject, useContext, useRef } from 'react';
import { z } from 'zod';

import useBreweryPostComments from '@/hooks/data-fetching/brewery-comments/useBreweryPostComments';
import {
  sendDeleteBreweryPostCommentRequest,
  sendEditBreweryPostCommentRequest,
} from '@/requests/comments/brewery-comment';
import CommentLoadingComponent from '../Comments/CommentLoadingComponent';
import CommentsComponent from '../Comments/CommentsComponent';
import BreweryCommentForm from './BreweryCommentForm';

interface BreweryBeerSectionProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}

const BreweryCommentsSection: FC<BreweryBeerSectionProps> = ({ breweryPost }) => {
  const { user } = useContext(UserContext);

  const PAGE_SIZE = 4;

  const {
    isLoading,
    setSize,
    size,
    isLoadingMore,
    isAtEnd,
    mutate,
    comments: breweryComments,
  } = useBreweryPostComments({ id: breweryPost.id, pageSize: PAGE_SIZE });

  const commentSectionRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  return (
    <div className="w-full space-y-3" ref={commentSectionRef}>
      <div className="card">
        <div className="card-body h-full">
          {user ? (
            <BreweryCommentForm breweryPost={breweryPost} mutate={mutate} />
          ) : (
            <div className="flex h-52 flex-col items-center justify-center">
              <div className="text-lg font-bold">Log in to leave a comment.</div>
            </div>
          )}
        </div>
      </div>
      {
        /**
         * If the comments are loading, show a loading component. Otherwise, show the
         * comments.
         */
        isLoading ? (
          <div className="card pb-6">
            <CommentLoadingComponent length={PAGE_SIZE} />
          </div>
        ) : (
          <CommentsComponent
            comments={breweryComments}
            isLoadingMore={isLoadingMore}
            isAtEnd={isAtEnd}
            pageSize={PAGE_SIZE}
            setSize={setSize}
            size={size}
            commentSectionRef={commentSectionRef}
            mutate={mutate}
            handleDeleteCommentRequest={(id) => {
              return sendDeleteBreweryPostCommentRequest({
                breweryPostId: breweryPost.id,
                commentId: id,
              });
            }}
            handleEditCommentRequest={(commentId, data) => {
              return sendEditBreweryPostCommentRequest({
                breweryPostId: breweryPost.id,
                commentId,
                body: { content: data.content, rating: data.rating },
              });
            }}
          />
        )
      }
    </div>
  );
};

export default BreweryCommentsSection;
