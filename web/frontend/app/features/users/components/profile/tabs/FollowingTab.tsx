import { Link } from 'react-router';
import EmptyState from '../EmptyState';

export interface FollowingEntry {
    userAccountId: string;
    name: string;
    username: string;
    avatarUrl: string;
}

const initials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

interface FollowingTabProps {
    following: FollowingEntry[];
    onUnfollow?: (userAccountId: string) => void;
}

const FollowingTab = ({ following, onUnfollow }: FollowingTabProps) => {
    if (following.length === 0) {
        return <EmptyState message="Not following anyone yet." />;
    }

    return (
        <div className="flex flex-col gap-3">
            {following.map((f) => (
                <div key={f.userAccountId} className="card bg-base-100 shadow">
                    <div className="card-body flex-row items-center gap-4 p-4">
                        <div
                            className={`avatar shrink-0 ${f.avatarUrl ? '' : 'avatar-placeholder'}`}
                        >
                            {f.avatarUrl ? (
                                <div className="w-11 rounded-full">
                                    <img src={f.avatarUrl} alt={`${f.name}'s avatar`} />
                                </div>
                            ) : (
                                <div className="bg-secondary text-secondary-content w-11 rounded-full">
                                    <span className="text-sm font-bold">{initials(f.name)}</span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <Link
                                to={`/users/${f.userAccountId}`}
                                className="font-semibold text-sm truncate link link-hover block"
                            >
                                {f.name}
                            </Link>
                            <p className="text-xs text-base-content/70 m-0 truncate">
                                @{f.username}
                            </p>
                        </div>
                        {onUnfollow && (
                            <button
                                type="button"
                                onClick={() => onUnfollow(f.userAccountId)}
                                className="btn btn-sm btn-outline shrink-0"
                            >
                                Following
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FollowingTab;
