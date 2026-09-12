import EmptyState from '../EmptyState';
import type { FillerFollowing } from '../../../utils/filler-user-profile';

const initials = (name: string) =>
    name
        .split(' ')
        .map((part) => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();

interface FollowingTabProps {
    following: (FillerFollowing & { isFollowing: boolean })[];
    onToggleFollow: (id: string) => void;
}

const FollowingTab = ({ following, onToggleFollow }: FollowingTabProps) => {
    if (following.length === 0) {
        return <EmptyState message="Not following anyone yet." />;
    }

    return (
        <div className="flex flex-col gap-3">
            {following.map((f) => (
                <div key={f.id} className="card bg-base-100 shadow">
                    <div className="card-body flex-row items-center gap-4 p-4">
                        <div className="avatar avatar-placeholder shrink-0">
                            <div className="bg-secondary text-secondary-content w-11 rounded-full">
                                <span className="text-sm font-bold">{initials(f.name)}</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm m-0 truncate">{f.name}</p>
                            <p className="text-xs text-base-content/60 m-0 truncate">{f.meta}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => onToggleFollow(f.id)}
                            className={`btn btn-sm shrink-0 ${f.isFollowing ? 'btn-outline' : 'btn-primary'}`}
                        >
                            {f.isFollowing ? 'Following' : 'Follow'}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default FollowingTab;
