import { useState } from 'react';
import { data } from 'react-router';
import RouteErrorState from '../../../components/ui/error/RouteErrorState';
import { getOptionalAuth } from '../../auth/auth.server';
import { getPublicUserProfile, type PublicUserProfile } from '../users.server';
import ProfileSidebarCard from '../components/profile/ProfileSidebarCard';
import ProfileTabs, { type ProfileTab } from '../components/profile/ProfileTabs';
import ActivityTab from '../components/profile/tabs/ActivityTab';
import FollowingTab from '../components/profile/tabs/FollowingTab';
import LikedTab from '../components/profile/tabs/LikedTab';
import {
    FILLER_ACTIVITY,
    FILLER_FOLLOWING,
    FILLER_LIKED,
    FILLER_PROFILE_META,
} from '../utils/filler-user-profile';
import type { Route } from './+types/user-profile';

export const meta = ({}: Route.MetaArgs) => [{ title: 'Profile | The Biergarten App' }];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const [profile, auth] = await Promise.all([
        getPublicUserProfile(params.id),
        getOptionalAuth(request),
    ]);

    if (!profile) {
        throw data('User not found.', { status: 404, statusText: 'Not Found' });
    }

    return {
        profile,
        isOwnProfile: auth?.userAccountId === profile.userAccountId,
    };
};

const joinedLabel = (isoDate: string) =>
    `Joined ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(isoDate))}`;

interface ProfileContentProps {
    profile: PublicUserProfile;
    isOwnProfile: boolean;
}

/**
 * Owns the profile-scoped interactive state. Keyed by `profile.userAccountId` in the
 * parent so React remounts it (resetting follow/tab state) when the route's `:id` changes,
 * since React Router reuses the route component itself across param-only navigations.
 */
const ProfileContent = ({ profile, isOwnProfile }: ProfileContentProps) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('activity');
    const [isFollowingProfile, setIsFollowingProfile] = useState(false);
    const [following, setFollowing] = useState(() =>
        FILLER_FOLLOWING.map((f) => ({ ...f, isFollowing: true })),
    );

    const handleToggleFollowRow = (id: string) => {
        setFollowing((prev) =>
            prev.map((f) => (f.id === id ? { ...f, isFollowing: !f.isFollowing } : f)),
        );
    };

    const displayName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username;

    const stats = [
        { label: 'Following', value: FILLER_PROFILE_META.following },
        { label: 'Followers', value: FILLER_PROFILE_META.followers },
        { label: 'Breweries visited', value: FILLER_PROFILE_META.breweriesVisited },
        { label: 'Ratings given', value: FILLER_PROFILE_META.ratingsGiven },
    ];

    return (
        <div className="min-h-screen bg-base-200 pb-16">
            <div className="max-w-[1080px] mx-auto px-6 pt-8">
                <div className="rounded-box h-[190px] bg-base-300" />

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start -mt-12">
                    <div className="lg:sticky lg:top-8 flex flex-col gap-5 px-2">
                        <div className="w-[120px] h-[120px] rounded-full border-4 border-base-200 shadow-md overflow-hidden">
                            <div className="avatar avatar-placeholder w-full h-full">
                                <div className="bg-secondary text-secondary-content w-full h-full flex items-center justify-center">
                                    <span className="text-2xl font-bold">
                                        {displayName.slice(0, 2).toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <ProfileSidebarCard
                            displayName={displayName}
                            username={profile.username}
                            bio={FILLER_PROFILE_META.bio}
                            location={FILLER_PROFILE_META.location}
                            joinedLabel={joinedLabel(profile.createdAt)}
                            stats={stats}
                            isOwnProfile={isOwnProfile}
                            isFollowing={isFollowingProfile}
                            onToggleFollow={() => setIsFollowingProfile((prev) => !prev)}
                        />
                    </div>

                    <div className="mt-12">
                        <ProfileTabs
                            activeTab={activeTab}
                            onChange={setActiveTab}
                            panels={{
                                activity: <ActivityTab activity={FILLER_ACTIVITY} />,
                                following: (
                                    <FollowingTab
                                        following={following}
                                        onToggleFollow={handleToggleFollowRow}
                                    />
                                ),
                                liked: <LikedTab liked={FILLER_LIKED} />,
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const UserProfile = ({ loaderData }: Route.ComponentProps) => {
    const { profile, isOwnProfile } = loaderData;

    return (
        <ProfileContent
            key={profile.userAccountId}
            profile={profile}
            isOwnProfile={isOwnProfile}
        />
    );
};

export default UserProfile;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => (
    <RouteErrorState error={error} />
);
