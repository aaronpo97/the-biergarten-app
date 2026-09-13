import { data } from 'react-router';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

export interface PublicUserProfile {
    userAccountId: string;
    username: string;
    firstName: string;
    lastName: string;
    createdAt: string;
}

/**
 * Fetches the public-facing slice of a user account from the dedicated public-profile
 * endpoint, which never includes `email` or `dateOfBirth`.
 */
export const getPublicUserProfile = async (
    userAccountId: string,
): Promise<PublicUserProfile | null> => {
    let res: Response;
    try {
        res = await fetch(
            `${API_BASE_URL}/api/user/${encodeURIComponent(userAccountId)}/profile`,
        );
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
        createdAt: string;
    } = await res.json();

    return {
        userAccountId: account.userAccountId,
        username: account.username,
        firstName: account.firstName,
        lastName: account.lastName,
        createdAt: account.createdAt,
    };
};
