import { data } from 'react-router';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:8080';

interface ApiResponse<T> {
    message: string;
    payload: T;
}

export interface BreweryCoordinates {
    latitude: number;
    longitude: number;
}

export interface BreweryLocation {
    breweryPostLocationId: string;
    breweryPostId: string;
    cityId: string;
    cityName: string;
    stateProvinceName: string;
    stateProvinceCode: string;
    countryName: string;
    countryCode: string;
    addressLine1: string;
    addressLine2: string | null;
    postalCode: string;
    coordinates: BreweryCoordinates | null;
}

export interface Brewery {
    breweryPostId: string;
    postedById: string;
    breweryName: string;
    description: string;
    createdAt: string;
    updatedAt: string | null;
    location: BreweryLocation | null;
}

export interface SimplifiedBrewery {
    breweryPostId: string;
    breweryName: string;
    location: BreweryLocation | null;
    distanceMetres: number | null;
}

const fetchApi = async (path: string): Promise<Response> => {
    try {
        return await fetch(`${API_BASE_URL}${path}`);
    } catch {
        throw data('The brewery service is unreachable right now. Please try again in a moment.', {
            status: 503,
            statusText: 'Service Unavailable',
        });
    }
};

export const getBreweries = async (limit?: number, offset?: number): Promise<Brewery[]> => {
    const params = new URLSearchParams();
    if (limit !== undefined) params.set('limit', String(limit));
    if (offset !== undefined) params.set('offset', String(offset));

    const res = await fetchApi(`/api/brewery?${params}`);

    if (!res.ok) {
        throw data(`Failed to load breweries (${res.status}).`, {
            status: res.status,
            statusText: res.statusText,
        });
    }

    const body: ApiResponse<Brewery[]> = await res.json();
    return body.payload;
};

export const getBreweryLocations = async (): Promise<SimplifiedBrewery[]> => {
    const res = await fetchApi('/api/brewery/locations');

    if (!res.ok) {
        throw data(`Failed to load brewery locations (${res.status}).`, {
            status: res.status,
            statusText: res.statusText,
        });
    }

    const body: ApiResponse<SimplifiedBrewery[]> = await res.json();
    return body.payload;
};

export const getBreweryLocationsNearby = async (
    latitude: number,
    longitude: number,
    rangeInMetres: number,
): Promise<SimplifiedBrewery[]> => {
    const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        rangeInMetres: String(rangeInMetres),
    });

    const res = await fetchApi(`/api/brewery/locations/nearby?${params}`);

    if (!res.ok) {
        throw data(`Failed to load nearby breweries (${res.status}).`, {
            status: res.status,
            statusText: res.statusText,
        });
    }

    const body: ApiResponse<SimplifiedBrewery[]> = await res.json();
    return body.payload;
};

export const getBreweryById = async (id: string): Promise<Brewery | null> => {
    const res = await fetchApi(`/api/brewery/${encodeURIComponent(id)}`);

    if (res.status === 404) {
        return null;
    }

    if (!res.ok) {
        throw data(`Failed to load brewery (${res.status}).`, {
            status: res.status,
            statusText: res.statusText,
        });
    }

    const body: ApiResponse<Brewery> = await res.json();
    return body.payload;
};
