import useBeerPostComments from '@/hooks/useBeerPostComments';
import CommentQueryResult from '@/services/types/CommentSchema/CommentQueryResult';
import { FC, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { z } from 'zod';
import CommentContentBody from './CommentContentBody';
import EditCommentBody from './EditCommentBody';

interface CommentCardProps {
  comment: z.infer<typeof CommentQueryResult>;
  mutate: ReturnType<typeof useBeerPostComments>['mutate'];
  ref?: ReturnType<typeof useInView>['ref'];
}

const CommentCardBody: FC<CommentCardProps> = ({ comment, mutate, ref }) => {
  const [inEditMode, setInEditMode] = useState(false);

  return !inEditMode ? (
    <CommentContentBody comment={comment} ref={ref} setInEditMode={setInEditMode} />
  ) : (
    <EditCommentBody
      comment={comment}
      mutate={mutate}
      setInEditMode={setInEditMode}
      ref={ref}
    />
  );
};

export default CommentCardBody;
