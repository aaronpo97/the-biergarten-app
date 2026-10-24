import { useState } from 'react';
import { data, useFetcher } from 'react-router';
import RouteErrorState from '../../../components/ui/error/RouteErrorState';
import { getOptionalAuth, requireAuth } from '../../auth/auth.server';
import {
    getFollowing,
    getFollowStatus,
    getPublicUserProfile,
    setFollowing,
    type FollowedUser,
    type PublicUserProfile,
} from '../users.server';
import ProfileAvatar from '../components/profile/ProfileAvatar';
import ProfileSidebarCard from '../components/profile/ProfileSidebarCard';
import ProfileTabs, { type ProfileTab } from '../components/profile/ProfileTabs';
import ActivityTab from '../components/profile/tabs/ActivityTab';
import FollowingTab, { type FollowingEntry } from '../components/profile/tabs/FollowingTab';
import LikedTab from '../components/profile/tabs/LikedTab';
import { FILLER_ACTIVITY, FILLER_LIKED, FILLER_PROFILE_META } from '../utils/filler-user-profile';
import type { Route } from './+types/user-profile';

export const meta = ({ loaderData }: Route.MetaArgs) => [
    {
        title: loaderData
            ? `${loaderData.profile.username} | The Biergarten App`
            : 'Profile | The Biergarten App',
    },
    {
        name: 'description',
        content: loaderData
            ? `See ${loaderData.profile.username}'s profile on The Biergarten App.`
            : 'View a member profile on The Biergarten App.',
    },
];

export const loader = async ({ request, params }: Route.LoaderArgs) => {
    const auth = await getOptionalAuth(request);

    const profile = await getPublicUserProfile(params.id, auth?.accessToken);
    if (!profile) {
        throw data('User not found.', { status: 404, statusText: 'Not Found' });
    }

    const isOwnProfile = auth?.userAccountId === profile.userAccountId;

    const [following, isFollowingProfile] = await Promise.all([
        getFollowing(profile.userAccountId),
        auth && !isOwnProfile ? getFollowStatus(profile.userAccountId, auth.accessToken) : false,
    ]);

    return { profile, isOwnProfile, following, isFollowingProfile };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const auth = await requireAuth(request);
    const form = await request.formData();
    const intent = form.get('intent');
    const targetId = form.get('targetId');

    if (typeof targetId !== 'string' || (intent !== 'follow' && intent !== 'unfollow')) {
        throw data('Invalid follow request.', { status: 400, statusText: 'Bad Request' });
    }

    await setFollowing(targetId, intent === 'follow', auth.accessToken);
    return null;
};

const toFollowingEntry = (f: FollowedUser): FollowingEntry => ({
    userAccountId: f.userAccountId,
    name: `${f.firstName} ${f.lastName}`.trim() || f.username,
    username: f.username,
    avatarUrl: f.avatarUrl,
});

const joinedLabel = (isoDate: string) =>
    `Joined ${new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date(isoDate))}`;

interface ProfileContentProps {
    profile: PublicUserProfile;
    isOwnProfile: boolean;
    following: FollowedUser[];
    isFollowingProfile: boolean;
}

/**
 * Owns the profile-scoped interactive state. Keyed by `profile.userAccountId` in the
 * parent so React remounts it (resetting follow/tab state) when the route's `:id` changes,
 * since React Router reuses the route component itself across param-only navigations.
 */
const ProfileContent = ({
    profile,
    isOwnProfile,
    following,
    isFollowingProfile,
}: ProfileContentProps) => {
    const [activeTab, setActiveTab] = useState<ProfileTab>('activity');
    const followFetcher = useFetcher();
    const unfollowFetcher = useFetcher();

    const pendingIntent = followFetcher.formData?.get('intent');
    const isFollowing = pendingIntent ? pendingIntent === 'follow' : isFollowingProfile;

    const handleToggleFollow = () => {
        followFetcher.submit(
            { intent: isFollowing ? 'unfollow' : 'follow', targetId: profile.userAccountId },
            { method: 'post' },
        );
    };

    const handleUnfollowRow = (targetId: string) => {
        unfollowFetcher.submit({ intent: 'unfollow', targetId }, { method: 'post' });
    };

    const displayName = `${profile.firstName} ${profile.lastName}`.trim() || profile.username;

    const stats = [
        { label: 'Following', value: profile.followingCount },
        { label: 'Followers', value: profile.followerCount },
        { label: 'Breweries visited', value: FILLER_PROFILE_META.breweriesVisited },
        { label: 'Ratings given', value: FILLER_PROFILE_META.ratingsGiven },
    ];

    return (
        <div className="min-h-screen bg-base-200 pb-16">
            <div className="mx-auto max-w-7xl px-5 pt-10">
                <div className="rounded-box h-[190px] bg-base-300" />

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 items-start -mt-12">
                    <div className="lg:sticky lg:top-8 flex flex-col gap-5 px-2">
                        <ProfileAvatar avatarUrl={profile.avatarUrl} displayName={displayName} />

                        <ProfileSidebarCard
                            displayName={displayName}
                            username={profile.username}
                            bio={profile.biography}
                            location={FILLER_PROFILE_META.location}
                            joinedLabel={joinedLabel(profile.createdAt)}
                            stats={stats}
                            isOwnProfile={isOwnProfile}
                            isFollowing={isFollowing}
                            onToggleFollow={handleToggleFollow}
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
                                        following={following.map(toFollowingEntry)}
                                        onUnfollow={isOwnProfile ? handleUnfollowRow : undefined}
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
    const { profile, isOwnProfile, following, isFollowingProfile } = loaderData;

    return (
        <ProfileContent
            key={profile.userAccountId}
            profile={profile}
            isOwnProfile={isOwnProfile}
            following={following}
            isFollowingProfile={isFollowingProfile}
        />
    );
};

export default UserProfile;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => (
    <RouteErrorState error={error} />
);
