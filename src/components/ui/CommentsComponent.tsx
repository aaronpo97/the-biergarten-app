import { FC, MutableRefObject } from 'react';
import { FaArrowUp } from 'react-icons/fa';

import { useInView } from 'react-intersection-observer';

import useBeerPostComments from '@/hooks/data-fetching/beer-comments/useBeerPostComments';

import useBreweryPostComments from '@/hooks/data-fetching/brewery-comments/useBreweryPostComments';
import NoCommentsCard from '../BeerById/NoCommentsCard';
import LoadingComponent from '../BeerById/LoadingComponent';
import CommentCardBody from '../BeerBreweryComments/CommentCardBody';

interface CommentsComponentProps {
  commentSectionRef: MutableRefObject<HTMLDivElement | null>;
  pageSize: number;
  size: ReturnType<typeof useBeerPostComments | typeof useBreweryPostComments>['size'];
  setSize: ReturnType<
    typeof useBeerPostComments | typeof useBreweryPostComments
  >['setSize'];
  comments: ReturnType<
    typeof useBeerPostComments | typeof useBreweryPostComments
  >['comments'];
  isAtEnd: ReturnType<
    typeof useBeerPostComments | typeof useBreweryPostComments
  >['isAtEnd'];
  isLoadingMore: ReturnType<
    typeof useBeerPostComments | typeof useBreweryPostComments
  >['isLoadingMore'];
  mutate: ReturnType<
    typeof useBeerPostComments | typeof useBreweryPostComments
  >['mutate'];
  handleDeleteRequest: (id: string) => Promise<void>;
  handleEditRequest: (
    id: string,
    data: { content: string; rating: number },
  ) => Promise<void>;
}

const CommentsComponent: FC<CommentsComponentProps> = ({
  commentSectionRef,
  comments,
  isAtEnd,
  isLoadingMore,
  pageSize,
  setSize,
  size,
  mutate,
  handleDeleteRequest,
  handleEditRequest,
}) => {
  const { ref: penultimateCommentRef } = useInView({
    /**
     * When the second last comment comes into view, call setSize from useBeerPostComments
     * to load more comments.
     */
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });

  return (
    <>
      {!!comments.length && (
        <div className="card bg-base-300 pb-6">
          {comments.map((comment, index) => {
            const isPenultimateComment = index === comments.length - 2;

            /**
             * Attach a ref to the last comment in the list. When it comes into view, the
             * component will call setSize to load more comments.
             */
            return (
              <div
                ref={isPenultimateComment ? penultimateCommentRef : undefined}
                key={comment.id}
              >
                <CommentCardBody
                  comment={comment}
                  mutate={mutate}
                  handleDeleteRequest={handleDeleteRequest}
                  handleEditRequest={handleEditRequest}
                />
              </div>
            );
          })}

          {
            /**
             * If there are more comments to load, show a loading component with a
             * skeleton loader and a loading spinner.
             */
            !!isLoadingMore && <LoadingComponent length={pageSize} />
          }

          {
            /**
             * If the user has scrolled to the end of the comments, show a button that
             * will scroll them back to the top of the comments section.
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
                      commentSectionRef.current?.scrollIntoView({
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
  );
};

export default CommentsComponent;
