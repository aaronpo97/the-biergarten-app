import { FC, useEffect, useState } from 'react';

import useGetBeerPostLikeCount from '@/hooks/data-fetching/beer-likes/useBeerPostLikeCount';
import useCheckIfUserLikesBeerStyle from '@/hooks/data-fetching/beer-style-likes/useCheckIfUserLikesBeerPost';
import sendBeerStyleLikeRequest from '@/requests/BeerStyleLike/sendBeerStyleLikeRequest';
import LikeButton from '../ui/LikeButton';

const BeerStyleLikeButton: FC<{
  beerStyleId: string;
  mutateCount: ReturnType<typeof useGetBeerPostLikeCount>['mutate'];
}> = ({ beerStyleId, mutateCount }) => {
  const { isLiked, mutate: mutateLikeStatus } = useCheckIfUserLikesBeerStyle(beerStyleId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, [isLiked]);

  const handleLike = async () => {
    try {
      setLoading(true);
      await sendBeerStyleLikeRequest(beerStyleId);

      await Promise.all([mutateCount(), mutateLikeStatus()]);
      setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  return <LikeButton isLiked={!!isLiked} handleLike={handleLike} loading={loading} />;
};

export default BeerStyleLikeButton;
