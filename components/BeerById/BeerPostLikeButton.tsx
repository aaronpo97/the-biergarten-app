import useCheckIfUserLikesBeerPost from '@/hooks/useCheckIfUserLikesBeerPost';
import sendLikeRequest from '@/requests/sendLikeRequest';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { FaThumbsUp, FaRegThumbsUp } from 'react-icons/fa';

const BeerPostLikeButton: FC<{
  beerPostId: string;
  setLikeCount: Dispatch<SetStateAction<number>>;
}> = ({ beerPostId, setLikeCount }) => {
  const { isLiked, mutate: mutateLikeStatus } = useCheckIfUserLikesBeerPost(beerPostId);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    try {
      setLoading(true);
      await sendLikeRequest(beerPostId);
      setLikeCount((prevCount) => prevCount + (isLiked ? -1 : 1));
      mutateLikeStatus();
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
