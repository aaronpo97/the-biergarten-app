import UserContext from '@/contexts/UserContext';

import { FC, MutableRefObject, useContext, useRef } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/router';
import CreateCommentValidationSchema from '@/services/schema/CommentSchema/CreateCommentValidationSchema';

import BeerStyleQueryResult from '@/services/posts/beer-style-post/schema/BeerStyleQueryResult';
import useBeerStyleComments from '@/hooks/data-fetching/beer-style-comments/useBeerStyleComments';
import LoadingComponent from '../BeerById/LoadingComponent';
import CommentsComponent from '../ui/CommentsComponent';
import BeerStyleCommentForm from './BeerStyleCommentForm';

interface BeerStyleCommentsSectionProps {
  beerStyle: z.infer<typeof BeerStyleQueryResult>;
}

const BeerStyleCommentsSection: FC<BeerStyleCommentsSectionProps> = ({ beerStyle }) => {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const pageNum = parseInt(router.query.comments_page as string, 10) || 1;
  const PAGE_SIZE = 15;

  const { comments, isLoading, mutate, setSize, size, isLoadingMore, isAtEnd } =
    useBeerStyleComments({ id: beerStyle.id, pageNum, pageSize: PAGE_SIZE });

  const commentSectionRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  const handleDeleteRequest = async (id: string) => {
    const response = await fetch(`/api/beers/styles/${beerStyle.id}/comments/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete comment.');
    }
  };

  const handleEditRequest = async (
    id: string,
    data: z.infer<typeof CreateCommentValidationSchema>,
  ) => {
    const response = await fetch(`/api/beers/styles/${beerStyle.id}/comments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: data.content, rating: data.rating }),
    });

    if (!response.ok) {
      throw new Error(response.statusText);
    }
  };

  return (
    <div className="w-full space-y-3" ref={commentSectionRef}>
      <div className="card bg-base-300">
        <div className="card-body h-full">
          {user ? (
            <BeerStyleCommentForm beerStyle={beerStyle} mutate={mutate} />
          ) : (
            <div className="flex h-52 flex-col items-center justify-center">
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
          <CommentsComponent
            commentSectionRef={commentSectionRef}
            comments={comments}
            isLoadingMore={isLoadingMore}
            isAtEnd={isAtEnd}
            pageSize={PAGE_SIZE}
            setSize={setSize}
            size={size}
            mutate={mutate}
            handleDeleteRequest={handleDeleteRequest}
            handleEditRequest={handleEditRequest}
          />
        )
      }
    </div>
  );
};

export default BeerStyleCommentsSection;
