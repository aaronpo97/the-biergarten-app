import UserContext from '@/contexts/UserContext';
import useBeerPostsByUser from '@/hooks/data-fetching/beer-posts/useBeerPostsByUser';
import { FC, useContext, MutableRefObject, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import BeerCard from '../BeerIndex/BeerCard';
import LoadingCard from '../ui/LoadingCard';
import Spinner from '../ui/Spinner';

const BeerPostsByUser: FC = () => {
  const { user } = useContext(UserContext);
  const pageRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const PAGE_SIZE = 2;
  const { beerPosts, setSize, size, isLoading, isLoadingMore, isAtEnd } =
    useBeerPostsByUser({ pageSize: PAGE_SIZE, userId: user!.id });
  const { ref: lastBeerPostRef } = useInView({
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });
  return (
    <div className="mt-4" ref={pageRef}>
      <div className="grid gap-6 xl:grid-cols-2">
        {!!beerPosts.length && !isLoading && (
          <>
            {beerPosts.map((beerPost, i) => {
              return (
                <div
                  key={beerPost.id}
                  ref={beerPosts.length === i + 1 ? lastBeerPostRef : undefined}
                >
                  <BeerCard post={beerPost} />
                </div>
              );
            })}
          </>
        )}
        {(isLoading || isLoadingMore) && (
          <>
            {Array.from({ length: PAGE_SIZE }, (_, i) => (
              <LoadingCard key={i} />
            ))}
          </>
        )}
      </div>

      {(isLoading || isLoadingMore) && (
        <div className="flex h-32 w-full items-center justify-center">
          <Spinner size="sm" />
        </div>
      )}

      {!!beerPosts.length && isAtEnd && !isLoading && (
        <div className="flex h-20 items-center justify-center text-center">
          <div className="tooltip tooltip-bottom" data-tip="Scroll back to top of page.">
            <button
              type="button"
              className="btn-ghost btn-sm btn"
              aria-label="Scroll back to top of page."
              onClick={() => {
                pageRef.current?.scrollIntoView({
                  behavior: 'smooth',
                });
              }}
            >
              <FaArrowUp />
            </button>
          </div>
        </div>
      )}

      {!beerPosts.length && !isLoading && (
        <div className="flex h-24 w-full items-center justify-center">
          <p className="text-lg font-bold">No posts yet.</p>
        </div>
      )}
    </div>
  );
};

export default BeerPostsByUser;
