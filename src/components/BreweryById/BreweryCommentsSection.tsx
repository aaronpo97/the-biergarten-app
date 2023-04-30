import UserContext from '@/contexts/userContext';
import BreweryPostQueryResult from '@/services/BreweryPost/types/BreweryPostQueryResult';
import { FC, MutableRefObject, useContext, useRef } from 'react';
import { z } from 'zod';
import useBreweryPostComments from '@/hooks/useBreweryPostComments';
import LoadingComponent from '../BeerById/LoadingComponent';
import CommentsComponent from '../ui/CommentsComponent';

interface BreweryBeerSectionProps {
  breweryPost: z.infer<typeof BreweryPostQueryResult>;
}

const BreweryCommentForm: FC = () => {
  return null;
};

const BreweryCommentsSection: FC<BreweryBeerSectionProps> = ({ breweryPost }) => {
  const { user } = useContext(UserContext);

  const { id } = breweryPost;

  const PAGE_SIZE = 4;

  const { comments, isLoading, setSize, size, isLoadingMore, isAtEnd } =
    useBreweryPostComments({ id, pageSize: PAGE_SIZE });

  const commentSectionRef: MutableRefObject<HTMLDivElement | null> = useRef(null);

  return (
    <div className="w-full space-y-3" ref={commentSectionRef}>
      <div className="card">
        {user ? (
          <BreweryCommentForm />
        ) : (
          <div className="flex h-52 flex-col items-center justify-center">
            <div className="text-lg font-bold">Log in to leave a comment.</div>
          </div>
        )}
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
            comments={comments}
            isLoadingMore={isLoadingMore}
            isAtEnd={isAtEnd}
            pageSize={PAGE_SIZE}
            setSize={setSize}
            size={size}
            commentSectionRef={commentSectionRef}
          />
        )
      }
    </div>
  );
};

export default BreweryCommentsSection;
