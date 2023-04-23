import useCheckIfUserLikesBeerPost from '@/hooks/useCheckIfUserLikesBeerPost';
import sendBeerPostLikeRequest from '@/requests/sendBeerPostLikeRequest';
import { FC, useEffect, useState } from 'react';

import useGetBeerPostLikeCount from '@/hooks/useBeerPostLikeCount';
import LikeButton from '../ui/LikeButton';

const BeerPostLikeButton: FC<{
  beerPostId: string;
  mutateCount: ReturnType<typeof useGetBeerPostLikeCount>['mutate'];
}> = ({ beerPostId, mutateCount }) => {
  const { isLiked, mutate: mutateLikeStatus } = useCheckIfUserLikesBeerPost(beerPostId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [isLiked]);

  const handleLike = async () => {
    try {
      setLoading(true);
      await sendBeerPostLikeRequest(beerPostId);

      await Promise.all([mutateCount(), mutateLikeStatus()]);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  return <LikeButton isLiked={!!isLiked} handleLike={handleLike} loading={loading} />;
};

export default BeerPostLikeButton;
