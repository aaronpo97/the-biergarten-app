/* eslint-disable no-nested-ternary */
import UserContext from '@/contexts/userContext';

import beerPostQueryResult from '@/services/BeerPost/schema/BeerPostQueryResult';

import { FC, MutableRefObject, useContext, useRef } from 'react';
import { z } from 'zod';
import useBeerPostComments from '@/hooks/useBeerPostComments';
import { useRouter } from 'next/router';
import { useInView } from 'react-intersection-observer';
import BeerCommentForm from './BeerCommentForm';

import CommentCardBody from './CommentCardBody';
import NoCommentsCard from './NoCommentsCard';
import CommentLoadingCardBody from './CommentLoadingCardBody';
import Spinner from '../ui/Spinner';

interface BeerPostCommentsSectionProps {
  beerPost: z.infer<typeof beerPostQueryResult>;
}

const LoadingComponent: FC<{ length: number }> = ({ length }) => {
  return (
    <>
      {Array.from({ length }).map((_, i) => (
        <CommentLoadingCardBody key={i} />
      ))}
      <div className="p-1">
        <Spinner size="sm" />
      </div>
    </>
  );
};

const BeerPostCommentsSection: FC<BeerPostCommentsSectionProps> = ({ beerPost }) => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const { id } = beerPost;
  const pageNum = parseInt(router.query.comments_page as string, 10) || 1;
  const PAGE_SIZE = 6;

  const { comments, isLoading, mutate, setSize, size, isLoadingMore, isAtEnd } =
    useBeerPostComments({
      id,
      pageNum,
      pageSize: PAGE_SIZE,
    });

  const { ref } = useInView({
    delay: 3000,
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });

  const sectionRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
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

      {comments && !!comments.length && !isLoading && (
        <div className="card bg-base-300 pb-6" ref={sectionRef}>
          {comments.map((comment, index) => {
            const isLastComment = index === comments.length - 1;

            return (
              <div ref={isLastComment ? ref : undefined} key={comment.id}>
                <CommentCardBody comment={comment} mutate={mutate} />
              </div>
            );
          })}

          {!!isLoadingMore && (
            <div>
              <LoadingComponent length={Math.floor(PAGE_SIZE / 2)} />
            </div>
          )}

          {isAtEnd && (
            <div className="flex h-10 items-center justify-center text-center">
              <button
                className="btn-ghost btn-sm btn"
                type="button"
                onClick={() => {
                  sectionRef.current!.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Scroll to top of comments
              </button>
            </div>
          )}
        </div>
      )}

      {!comments?.length && !isLoading && <NoCommentsCard />}

      {isLoading && (
        <div className="card bg-base-300 pb-6">
          <LoadingComponent length={PAGE_SIZE} />
        </div>
      )}
    </div>
  );
};

export default BeerPostCommentsSection;
