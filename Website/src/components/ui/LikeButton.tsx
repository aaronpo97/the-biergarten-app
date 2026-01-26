import { FC } from 'react';
import { FaThumbsUp, FaRegThumbsUp } from 'react-icons/fa';

interface LikeButtonProps {
  isLiked: boolean;
  handleLike: () => Promise<void>;
  loading: boolean;
}

const LikeButton: FC<LikeButtonProps> = ({ isLiked, handleLike, loading }) => {
  return (
    <button
      type="button"
      className={`btn btn-sm gap-2 rounded-2xl lg:btn-md ${
        !isLiked ? 'btn-ghost outline' : 'btn-primary'
      }`}
      onClick={() => {
        handleLike();
      }}
      disabled={loading}
    >
      {isLiked ? (
        <>
          <FaThumbsUp className="lg:text-2xl" />
          Liked
        </>
      ) : (
        <>
          <FaRegThumbsUp className="lg:text-2xl" />
          Like
        </>
      )}
    </button>
  );
};

export default LikeButton;
