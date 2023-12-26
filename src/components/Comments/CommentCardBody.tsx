import useBeerPostComments from '@/hooks/data-fetching/beer-comments/useBeerPostComments';
import CommentQueryResult from '@/services/schema/CommentSchema/CommentQueryResult';
import { FC, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';

import CommentContentBody from './CommentContentBody';
import EditCommentBody from './EditCommentBody';
import UserAvatar from '../Account/UserAvatar';
import { HandleDeleteCommentRequest, HandleEditCommentRequest } from './types';

interface CommentCardProps {
  comment: z.infer<typeof CommentQueryResult>;
  mutate: ReturnType<typeof useBeerPostComments>['mutate'];
  ref?: ReturnType<typeof useInView>['ref'];
  handleDeleteCommentRequest: HandleDeleteCommentRequest;
  handleEditCommentRequest: HandleEditCommentRequest;
}

const CommentCardBody: FC<CommentCardProps> = ({
  comment,
  mutate,
  ref,
  handleDeleteCommentRequest,
  handleEditCommentRequest,
}) => {
  const [inEditMode, setInEditMode] = useState(false);

  return (
    <div ref={ref} className="flex items-start">
      <div className="mx-3 w-[20%] justify-center sm:w-[12%]">
        <div className="h-20 pt-4">
          <UserAvatar user={comment.postedBy} />
        </div>
      </div>

      <div className="h-full w-[88%]">
        {!inEditMode ? (
          <CommentContentBody comment={comment} setInEditMode={setInEditMode} />
        ) : (
          <EditCommentBody
            comment={comment}
            mutate={mutate}
            setInEditMode={setInEditMode}
            handleDeleteCommentRequest={handleDeleteCommentRequest}
            handleEditCommentRequest={handleEditCommentRequest}
          />
        )}
      </div>
    </div>
  );
};

export default CommentCardBody;
