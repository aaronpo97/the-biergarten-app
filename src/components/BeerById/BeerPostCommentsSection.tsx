/* eslint-disable no-nested-ternary */
import UserContext from '@/contexts/userContext';

import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';

import { FC, MutableRefObject, useContext, useRef } from 'react';
import { z } from 'zod';
import useBeerPostComments from '@/hooks/useBeerPostComments';
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';
import { FaArrowUp } from 'react-icons/fa';
import BeerCommentForm from './BeerCommentForm';

import CommentCardBody from './CommentCardBody';
import NoCommentsCard from './NoCommentsCard';
import LoadingComponent from './LoadingComponent';

interface BeerPostCommentsSectionProps {
  beerPost: z.infer<typeof beerPostQueryResult>;
}

const BeerPostCommentsSection: FC<BeerPostCommentsSectionProps> = ({ beerPost }) => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const { id } = beerPost;
  const pageNum = parseInt(router.query.comments_page as string, 10) || 1;
  const PAGE_SIZE = 4;

  const { comments, isLoading, mutate, setSize, size, isLoadingMore, isAtEnd } =
    useBeerPostComments({
      id,
      pageNum,
      pageSize: PAGE_SIZE,
    });

  const { ref: lastCommentRef } = useInView({
    /**
     * When the last comment comes into view, call setSize from useBeerPostComments to
     * load more comments.
     */
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });

  const sectionRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  return (
    <div className="w-full space-y-3">
      <div className="card h-96 bg-base-300">
        <div className="card-body h-full" ref={sectionRef}>
          {user ? (
            <BeerCommentForm beerPost={beerPost} mutate={mutate} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center">
              <span className="text-lg font-bold">Log in to leave a comment.</span>
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
          <div className="card bg-base-300 pb-6">
            <LoadingComponent length={PAGE_SIZE} />
          </div>
        ) : (
          <>
            {!!comments.length && (
              <div className="card bg-base-300 pb-6">
                {comments.map((comment, index) => {
                  const isLastComment = index === comments.length - 1;

                  /**
                   * Attach a ref to the last comment in the list. When it comes into
                   * view, the component will call setSize to load more comments.
                   */
                  return (
                    <div
                      ref={isLastComment ? lastCommentRef : undefined}
                      key={comment.id}
                    >
                      <CommentCardBody comment={comment} mutate={mutate} />
                    </div>
                  );
                })}

                {
                  /**
                   * If there are more comments to load, show a loading component with a
                   * skeleton loader and a loading spinner.
                   */
                  !!isLoadingMore && (
                    <LoadingComponent length={Math.floor(PAGE_SIZE / 2)} />
                  )
                }

                {
                  /**
                   * If the user has scrolled to the end of the comments, show a button
                   * that will scroll them back to the top of the comments section.
                   */
                  !!isAtEnd && (
                    <div className="flex h-20 items-center justify-center text-center">
                      <div
                        className="tooltip tooltip-bottom"
                        data-tip="Scroll back to top of comments."
                      >
                        <button
                          type="button"
                          className="btn-ghost btn-sm btn"
                          aria-label="Scroll back to top of comments"
                          onClick={() => {
                            sectionRef.current?.scrollIntoView({
                              behavior: 'smooth',
                            });
                          }}
                        >
                          <FaArrowUp />
                        </button>
                      </div>
                    </div>
                  )
                }
              </div>
            )}

            {!comments.length && <NoCommentsCard />}
          </>
        )
      }
    </div>
  );
};

export default BeerPostCommentsSection;
