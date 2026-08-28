import { Heart, HeartSolid } from 'iconoir-react';
import StarRating from './StarRating';
import type { FillerComment } from '../utils/filler-brewery-detail';

interface CommentItemProps {
    comment: FillerComment;
    onToggleLike: (id: string) => void;
}

const CommentItem = ({ comment, onToggleLike }: CommentItemProps) => {
    const likeCount = comment.likes + (comment.liked ? 1 : 0);

    return (
        <div className="flex gap-3 items-start border-t border-base-content/10 pt-4">
            <div className="avatar avatar-placeholder shrink-0">
                <div className="bg-secondary text-secondary-content w-9 rounded-full">
                    <span className="text-sm font-bold">{comment.initials}</span>
                </div>
            </div>
            <div className="flex-1 flex flex-col gap-1 min-w-0">
                <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-bold text-sm">{comment.user}</span>
                    <StarRating value={comment.rating} size="xs" />
                    <span className="text-xs text-base-content/60">{comment.time}</span>
                </div>
                <p className="text-sm leading-relaxed m-0">{comment.text}</p>
                <button
                    type="button"
                    onClick={() => onToggleLike(comment.id)}
                    className={`self-start inline-flex items-center gap-1 text-xs font-semibold ${
                        comment.liked ? 'text-primary' : 'text-base-content/60'
                    }`}
                >
                    {comment.liked ? (
                        <HeartSolid className="size-3.5" aria-hidden="true" />
                    ) : (
                        <Heart className="size-3.5" aria-hidden="true" />
                    )}
                    {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                </button>
            </div>
        </div>
    );
};

export default CommentItem;
