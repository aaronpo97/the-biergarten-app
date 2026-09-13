// see USER_PROFILE_HANDOFF.md — filler data pending backend support for
// bio, location, avatar/cover photos, follower/following stats, and activity feeds.

export interface FillerProfileMeta {
    bio: string;
    location: string;
    following: number;
    followers: number;
    breweriesVisited: number;
    ratingsGiven: number;
}

export const FILLER_PROFILE_META: FillerProfileMeta = {
    bio: 'Homebrewer turned hop enthusiast. Chasing the best stout in the Midwest, one taproom at a time. 🍺',
    location: 'Portland, OR',
    following: 68,
    followers: 214,
    breweriesVisited: 37,
    ratingsGiven: 112,
};

export interface FillerActivity {
    id: string;
    icon: 'star' | 'heart' | 'comment';
    verb: string;
    target: string;
    rating?: number;
    comment?: string;
    time: string;
}

export const FILLER_ACTIVITY: FillerActivity[] = [
    {
        id: '1',
        icon: 'star',
        verb: 'Rated',
        target: 'Fremont Brewing — Interurban IPA',
        rating: 5,
        time: '2 hours ago',
    },
    {
        id: '2',
        icon: 'heart',
        verb: 'Liked',
        target: 'Stormbreaker Brewing',
        time: '1 day ago',
    },
    {
        id: '3',
        icon: 'comment',
        verb: 'Commented on',
        target: 'Great Notion — Blueberry Muffin',
        comment: "Best fruited stout I've had this year, worth the line.",
        time: '3 days ago',
    },
    {
        id: '4',
        icon: 'star',
        verb: 'Rated',
        target: 'Baerlic Brewing Co.',
        rating: 4,
        time: '5 days ago',
    },
    {
        id: '5',
        icon: 'heart',
        verb: 'Liked',
        target: 'Ecliptic Brewing — Phase Shift IPA',
        time: '1 week ago',
    },
];

export interface FillerFollowing {
    id: string;
    name: string;
    meta: string;
    userAccountId?: string;
}

// `userAccountId` is left unset for rows below since no backend account backs them yet;
// FollowingTab only links a row once a real account GUID is available (see USER_PROFILE_HANDOFF.md).
export const FILLER_FOLLOWING: FillerFollowing[] = [
    { id: '1', name: 'Breakside Brewery', meta: 'Portland, OR · Brewery' },
    { id: '2', name: 'Jonah Weckstein', meta: '@jweck · 142 ratings' },
    { id: '3', name: 'Wayfinder Beer', meta: 'Portland, OR · Brewery' },
    { id: '4', name: 'Casey Blume', meta: '@caseyb · 88 ratings' },
];

export interface FillerLiked {
    id: string;
    name: string;
    meta: string;
    rating: number;
}

export const FILLER_LIKED: FillerLiked[] = [
    { id: '1', name: 'Interurban IPA', meta: 'Fremont Brewing', rating: 5 },
    { id: '2', name: 'Blueberry Muffin', meta: 'Great Notion Brewing', rating: 5 },
    { id: '3', name: 'Phase Shift IPA', meta: 'Ecliptic Brewing', rating: 4 },
    { id: '4', name: 'Snapshot Wheat', meta: 'Deschutes Brewery', rating: 4 },
];
