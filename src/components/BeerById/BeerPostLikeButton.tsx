import useCheckIfUserLikesBeerPost from '@/hooks/useCheckIfUserLikesBeerPost';
import sendLikeRequest from '@/requests/sendLikeRequest';
import { FC, useEffect, useState } from 'react';
import { FaThumbsUp, FaRegThumbsUp } from 'react-icons/fa';

import useGetLikeCount from '@/hooks/useGetLikeCount';

const BeerPostLikeButton: FC<{
  beerPostId: string;
  mutateCount: ReturnType<typeof useGetLikeCount>['mutate'];
}> = ({ beerPostId, mutateCount }) => {
  const { isLiked, mutate: mutateLikeStatus } = useCheckIfUserLikesBeerPost(beerPostId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [isLiked]);

  const handleLike = async () => {
    try {
      setLoading(true);
      await sendLikeRequest(beerPostId);
      await mutateCount();
      await mutateLikeStatus();
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      className={`btn gap-2 rounded-2xl ${
        !isLiked ? 'btn-ghost outline' : 'btn-primary'
      }`}
      onClick={() => {
        handleLike();
      }}
      disabled={loading}
    >
      {isLiked ? (
        <>
          <FaThumbsUp className="text-2xl" />
          Liked
        </>
      ) : (
        <>
          <FaRegThumbsUp className="text-2xl" />
          Like
        </>
      )}
    </button>
  );
};

export default BeerPostLikeButton;
