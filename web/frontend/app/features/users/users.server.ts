import { data } from 'react-router';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export interface PublicUserProfile {
    userAccountId: string;
    username: string;
    firstName: string;
    lastName: string;
    biography: string;
    avatarUrl: string;
    createdAt: string;
    followerCount: number;
    followingCount: number;
}

export interface FollowedUser {
    userAccountId: string;
    username: string;
    firstName: string;
    lastName: string;
    avatarUrl: string;
    followedAt: string;
}

/**
 * Fetches the public-facing slice of a user account from the dedicated public-profile
 * endpoint, which never includes `email` or `dateOfBirth`. The endpoint is anonymous-accessible,
 * so `accessToken` is optional and only sent when the caller is signed in.
 */
export const getPublicUserProfile = async (
    userAccountId: string,
    accessToken?: string,
): Promise<PublicUserProfile | null> => {
    let res: Response;
    try {
        res = await fetch(`${API_BASE_URL}/api/user/${encodeURIComponent(userAccountId)}/profile`, {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        });
    } catch {
        throw data('The user service is unreachable right now. Please try again in a moment.', {
            status: 503,
            statusText: 'Service Unavailable',
        });
    }

    if (res.status === 404) {
        return null;
    }

    if (!res.ok) {
        throw data(`Failed to load user profile (${res.status}).`, {
            status: res.status,
            statusText: res.statusText,
        });
    }

    const account: {
        userAccountId: string;
        username: string;
        firstName: string;
        lastName: string;
        biography: string;
        avatarUrl: string;
        createdAt: string;
        followerCount: number;
        followingCount: number;
    } = await res.json();

    return {
        userAccountId: account.userAccountId,
        username: account.username,
        firstName: account.firstName,
        lastName: account.lastName,
        biography: account.biography,
        avatarUrl: account.avatarUrl,
        createdAt: account.createdAt,
        followerCount: account.followerCount,
        followingCount: account.followingCount,
    };
};

const fetchUserService = async (path: string, init?: RequestInit): Promise<Response> => {
    try {
        return await fetch(`${API_BASE_URL}${path}`, init);
    } catch {
        throw data('The user service is unreachable right now. Please try again in a moment.', {
            status: 503,
            statusText: 'Service Unavailable',
        });
    }
};

const bearer = (accessToken: string) => ({ Authorization: `Bearer ${accessToken}` });

export const getFollowing = async (userAccountId: string): Promise<FollowedUser[]> => {
    const res = await fetchUserService(`/api/user/${encodeURIComponent(userAccountId)}/following`);

    if (!res.ok) {
        throw data(`Failed to load followed users (${res.status}).`, {
            status: res.status,
            statusText: res.statusText,
        });
    }

    return res.json();
};

export const getFollowStatus = async (
    userAccountId: string,
    accessToken: string,
): Promise<boolean> => {
    const res = await fetchUserService(
        `/api/user/${encodeURIComponent(userAccountId)}/follow-status`,
        { headers: bearer(accessToken) },
    );

    if (!res.ok) {
        throw data(`Failed to load follow status (${res.status}).`, {
            status: res.status,
            statusText: res.statusText,
        });
    }

    const status: { isFollowing: boolean } = await res.json();
    return status.isFollowing;
};

export const setFollowing = async (
    userAccountId: string,
    shouldFollow: boolean,
    accessToken: string,
): Promise<void> => {
    const res = await fetchUserService(`/api/user/${encodeURIComponent(userAccountId)}/follow`, {
        method: shouldFollow ? 'PUT' : 'DELETE',
        headers: bearer(accessToken),
    });

    if (!res.ok) {
        throw data(`Failed to ${shouldFollow ? 'follow' : 'unfollow'} user (${res.status}).`, {
            status: res.status,
            statusText: res.statusText,
        });
    }
};
