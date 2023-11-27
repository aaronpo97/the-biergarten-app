import UserContext from '@/contexts/UserContext';
import { FC, useContext, MutableRefObject, useRef } from 'react';
import { FaArrowUp } from 'react-icons/fa';
import { useInView } from 'react-intersection-observer';
import useBreweryPostsByUser from '@/hooks/data-fetching/brewery-posts/useBreweryPostsByUser';
import LoadingCard from '../ui/LoadingCard';
import Spinner from '../ui/Spinner';
import BreweryCard from '../BreweryIndex/BreweryCard';

const BreweryPostsByUser: FC = () => {
  const { user } = useContext(UserContext);
  const pageRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const PAGE_SIZE = 2;
  const { breweryPosts, setSize, size, isLoading, isLoadingMore, isAtEnd } =
    useBreweryPostsByUser({ pageSize: PAGE_SIZE, userId: user!.id });

  const { ref: lastBreweryPostRef } = useInView({
    onChange: (visible) => {
      if (!visible || isAtEnd) return;
      setSize(size + 1);
    },
  });

  return (
    <div className="mt-4" ref={pageRef}>
      <div className="grid gap-6 xl:grid-cols-2">
        {!!breweryPosts.length && !isLoading && (
          <>
            {breweryPosts.map((breweryPost, i) => {
              return (
                <div
                  key={breweryPost.id}
                  ref={breweryPosts.length === i + 1 ? lastBreweryPostRef : undefined}
                >
                  <BreweryCard brewery={breweryPost} />
                </div>
              );
            })}
          </>
        )}
        {isLoadingMore && (
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

      {!!breweryPosts.length && isAtEnd && !isLoading && (
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

      {!breweryPosts.length && !isLoading && (
        <div className="flex h-24 w-full items-center justify-center">
          <p className="text-lg font-bold">No posts yet.</p>
        </div>
      )}
    </div>
  );
};

export default BreweryPostsByUser;
