import { Calendar, MapPin } from 'iconoir-react';
import { Link } from 'react-router';

interface ProfileStat {
    label: string;
    value: number;
}

interface ProfileSidebarCardProps {
    displayName: string;
    username: string;
    bio: string;
    location: string;
    joinedLabel: string;
    stats: ProfileStat[];
    isOwnProfile: boolean;
    isFollowing: boolean;
    onToggleFollow: () => void;
}

const ProfileSidebarCard = ({
    displayName,
    username,
    bio,
    location,
    joinedLabel,
    stats,
    isOwnProfile,
    isFollowing,
    onToggleFollow,
}: ProfileSidebarCardProps) => (
    <div className="card bg-base-100 shadow">
        <div className="card-body gap-4 p-6">
            <div>
                <h1 className="text-2xl font-bold m-0 leading-tight">{displayName}</h1>
                <p className="text-sm text-base-content/60 m-0 mt-0.5">@{username}</p>
            </div>

            {isOwnProfile ? (
                <Link to="/account" className="btn btn-outline btn-block">
                    Edit profile
                </Link>
            ) : (
                <button
                    type="button"
                    onClick={onToggleFollow}
                    className={`btn btn-block ${isFollowing ? 'btn-outline' : 'btn-primary'}`}
                >
                    {isFollowing ? 'Following' : 'Follow'}
                </button>
            )}

            <p className="text-sm leading-normal m-0">{bio}</p>

            <div className="flex flex-col gap-1.5 text-sm text-base-content/60">
                <div className="flex items-center gap-1.5">
                    <MapPin className="size-4 shrink-0" aria-hidden="true" />
                    {location}
                </div>
                <div className="flex items-center gap-1.5">
                    <Calendar className="size-4 shrink-0" aria-hidden="true" />
                    {joinedLabel}
                </div>
            </div>

            <div className="divider m-0" />

            <div className="flex flex-col gap-2">
                {stats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between gap-2">
                        <span className="text-sm text-base-content/60">{stat.label}</span>
                        <span className="font-serif text-lg font-bold tabular-nums">
                            {stat.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default ProfileSidebarCard;
