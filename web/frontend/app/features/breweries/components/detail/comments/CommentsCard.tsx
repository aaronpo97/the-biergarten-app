import { useState } from 'react';
import CommentItem from './CommentItem';
import type { FillerComment } from '../../../utils/filler-brewery-detail';

interface CommentsCardProps {
    comments: FillerComment[];
    loggedIn: boolean;
    currentUserInitials: string;
    onAddComment: (text: string) => void;
    onToggleCommentLike: (id: string) => void;
}

const CommentsCard = ({
    comments,
    loggedIn,
    currentUserInitials,
    onAddComment,
    onToggleCommentLike,
}: CommentsCardProps) => {
    const [commentText, setCommentText] = useState('');

    const handleSubmit = () => {
        const text = commentText.trim();
        if (!text) return;
        onAddComment(text);
        setCommentText('');
    };

    return (
        <div className="card bg-base-100 shadow">
            <div className="card-body gap-5 p-6">
                <h3 className="text-xl m-0">Comments ({comments.length})</h3>

                {loggedIn ? (
                    <div className="flex gap-3 items-start">
                        <div className="avatar avatar-placeholder shrink-0">
                            <div className="bg-secondary text-secondary-content w-9 rounded-full">
                                <span className="text-sm font-bold">{currentUserInitials}</span>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col gap-2">
                            <textarea
                                rows={3}
                                placeholder="Share your thoughts on this brewery"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                className="textarea w-full"
                            />
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={!commentText.trim()}
                                className="btn btn-sm btn-primary self-end"
                            >
                                Post comment
                            </button>
                        </div>
                    </div>
                ) : (
                    <div role="alert" className="alert alert-info alert-soft">
                        Sign in to like, rate, and comment on breweries.
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {comments.map((comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onToggleLike={onToggleCommentLike}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CommentsCard;
