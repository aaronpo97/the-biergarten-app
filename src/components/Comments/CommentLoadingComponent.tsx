import { FC } from 'react';
import Spinner from '../ui/Spinner';
import CommentLoadingCardBody from './CommentLoadingCardBody';

interface CommentLoadingComponentProps {
  length: number;
}

const CommentLoadingComponent: FC<CommentLoadingComponentProps> = ({ length }) => {
  return (
    <>
      {Array.from({ length }).map((_, i) => (
        <CommentLoadingCardBody key={i} />
      ))}
      <div className="p-1">
        <Spinner size="sm" />
      </div>
    </>
  );
};

export default CommentLoadingComponent;
