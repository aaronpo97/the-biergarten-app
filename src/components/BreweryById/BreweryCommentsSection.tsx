import UserContext from '@/contexts/UserContext';
import BreweryPostQueryResult from '@/services/posts/brewery-post/schema/BreweryPostQueryResult';
import { FC, MutableRefObject, useContext, useRef } from 'react';
import { z } from 'zod';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';

import useBreweryPostComments from '@/hooks/data-fetching/brewery-comments/useBreweryPostComments';
import LoadingComponent from '../BeerById/LoadingComponent';
import CommentsComponent from '../ui/CommentsComponent';
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

  const handleDeleteRequest = async (commentId: string) => {
    const response = await fetch(
      `/api/breweries/${breweryPost.id}/comments/${commentId}`,
      { method: 'DELETE' },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  };

  const handleEditRequest = async (
    commentId: string,
    data: z.infer<typeof CreateCommentValidationSchema>,
  ) => {
    const response = await fetch(
      `/api/breweries/${breweryPost.id}/comments/${commentId}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: data.content, rating: data.rating }),
      },
    );

    if (!response.ok) {
      throw new Error(response.statusText);
    }
    console.log(await response.json());
  };

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
            <LoadingComponent length={PAGE_SIZE} />
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
            handleDeleteRequest={handleDeleteRequest}
            handleEditRequest={handleEditRequest}
          />
        )
      }
    </div>
  );
};

export default BreweryCommentsSection;
