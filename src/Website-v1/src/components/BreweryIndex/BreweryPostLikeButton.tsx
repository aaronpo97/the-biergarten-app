import useCheckIfUserLikesBreweryPost from '@/hooks/data-fetching/brewery-likes/useCheckIfUserLikesBreweryPost';
import useGetBreweryPostLikeCount from '@/hooks/data-fetching/brewery-likes/useGetBreweryPostLikeCount';
import sendBreweryPostLikeRequest from '@/requests/likes/brewery-post-like/sendBreweryPostLikeRequest';
import { FC, useState } from 'react';
import LikeButton from '../ui/LikeButton';

const BreweryPostLikeButton: FC<{
  breweryPostId: string;
  mutateCount: ReturnType<typeof useGetBreweryPostLikeCount>['mutate'];
}> = ({ breweryPostId, mutateCount }) => {
  const { isLiked, mutate: mutateLikeStatus } =
    useCheckIfUserLikesBreweryPost(breweryPostId);

  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async () => {
    try {
      setIsLoading(true);
      await sendBreweryPostLikeRequest(breweryPostId);
      await Promise.all([mutateCount(), mutateLikeStatus()]);
      setIsLoading(false);
    } catch (e) {
      setIsLoading(false);
    }
  };

  return <LikeButton isLiked={!!isLiked} handleLike={handleLike} loading={isLoading} />;
};

export default BreweryPostLikeButton;
