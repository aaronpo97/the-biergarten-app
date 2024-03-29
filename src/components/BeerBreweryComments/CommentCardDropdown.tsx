import UserContext from '@/contexts/UserContext';
import { Dispatch, SetStateAction, FC, useContext } from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import { z } from 'zod';

interface CommentCardDropdownProps {
  comment: z.infer<typeof CommentQueryResult>;
  setInEditMode: Dispatch<SetStateAction<boolean>>;
}

const CommentCardDropdown: FC<CommentCardDropdownProps> = ({
  comment,
  setInEditMode,
}) => {
  const { user } = useContext(UserContext);
  const isCommentOwner = user?.id === comment.postedBy.id;

  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-sm m-1">
        <FaEllipsisH />
      </label>
      <ul
        tabIndex={0}
        className="menu dropdown-content rounded-box w-52 bg-base-100 p-2 shadow"
      >
        <li>
          {isCommentOwner ? (
            <button
              type="button"
              onClick={() => {
                setInEditMode(true);
              }}
            >
              Edit
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                // eslint-disable-next-line no-alert
                alert('This feature is not yet implemented.');
              }}
            >
              Report
            </button>
          )}
        </li>
      </ul>
    </div>
  );
};

export default CommentCardDropdown;
