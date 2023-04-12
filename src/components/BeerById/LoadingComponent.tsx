import { FC } from 'react';
import Spinner from '../ui/Spinner';
import CommentLoadingCardBody from './CommentLoadingCardBody';

interface LoadingComponentProps {
  length: number;
}

const LoadingComponent: FC<LoadingComponentProps> = ({ length }) => {
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

export default LoadingComponent;
