import UserContext from '@/contexts/userContext';
import sendCheckIfUserLikesBeerPostRequest from '@/requests/sendCheckIfUserLikesBeerPostRequest';
import sendLikeRequest from '@/requests/sendLikeRequest';
import { Dispatch, FC, SetStateAction, useContext, useEffect, useState } from 'react';
import { FaThumbsUp, FaRegThumbsUp } from 'react-icons/fa';

const BeerPostLikeButton: FC<{
  beerPostId: string;
  setLikeCount: Dispatch<SetStateAction<number>>;
}> = ({ beerPostId, setLikeCount }) => {
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const { user } = useContext(UserContext);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    sendCheckIfUserLikesBeerPostRequest(beerPostId)
      .then((currentLikeStatus) => {
        setIsLiked(currentLikeStatus);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [user, beerPostId]);

  const handleLike = async () => {
    try {
      setLoading(true);
      await sendLikeRequest(beerPostId);
      setIsLiked(!isLiked);
      setLikeCount((prevCount) => prevCount + (isLiked ? -1 : 1));
      setLoading(false);
    } catch (error) {
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
