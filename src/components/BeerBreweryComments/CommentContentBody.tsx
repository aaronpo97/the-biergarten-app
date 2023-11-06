import UserContext from '@/contexts/UserContext';
import useTimeDistance from '@/hooks/utilities/useTimeDistance';
import { format } from 'date-fns';
import { Dispatch, FC, SetStateAction, useContext } from 'react';
import { Rating } from 'react-daisyui';
import Link from 'next/link';
import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import Image from 'next/image';
import { z } from 'zod';
import CommentCardDropdown from './CommentCardDropdown';

interface CommentContentBodyProps {
  comment: z.infer<typeof CommentQueryResult>;
  setInEditMode: Dispatch<SetStateAction<boolean>>;
}

const CommentContentBody: FC<CommentContentBodyProps> = ({ comment, setInEditMode }) => {
  const { user } = useContext(UserContext);
  const timeDistance = useTimeDistance(new Date(comment.createdAt));

  return (
    <div className="card-body animate-in fade-in-10">
      <div className="flex space-x-5">
        <div className="w-2/12 avatar display flex items-center justify-center">
          <div className="w-28 h-28 rounded-full ring ring-primary">
            {comment.postedBy.userAvatar ? (
              <Image
                src={comment.postedBy.userAvatar.path}
                alt={comment.postedBy.userAvatar.alt}
                width={200}
                height={200}
              />
            ) : (
              <div className="flex items-center justify-center w-full h-full text-2xl font-bold text-white bg-primary rounded-full">
                {comment.postedBy.username[0]}
              </div>
            )}
          </div>
        </div>
        <div className="w-10/12 space-y-2">
          <div className="flex flex-row justify-between">
            <div>
              <p className="font-semibold sm:text-2xl">
                <Link href={`/users/${comment.postedBy.id}`} className="link-hover link">
                  {comment.postedBy.username}
                </Link>
              </p>
              <span className="italic">
                posted{' '}
                <time
                  className="tooltip tooltip-bottom"
                  data-tip={format(new Date(comment.createdAt), 'MM/dd/yyyy')}
                >
                  {timeDistance}
                </time>{' '}
                ago
              </span>
            </div>

            {user && (
              <CommentCardDropdown comment={comment} setInEditMode={setInEditMode} />
            )}
          </div>
          <div className="space-y-1">
            <Rating value={comment.rating}>
              {Array.from({ length: 5 }).map((val, index) => (
                <Rating.Item
                  name="rating-1"
                  className="mask mask-star cursor-default"
                  disabled
                  aria-disabled
                  key={index}
                />
              ))}
            </Rating>
          </div>
          <div>
            <p>{comment.content}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentContentBody;
