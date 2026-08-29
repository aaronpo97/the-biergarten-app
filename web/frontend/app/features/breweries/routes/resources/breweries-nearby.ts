import { data } from 'react-router';
import { getBreweryLocationsNearby } from '../../breweries.server';
import type { Route } from './+types/breweries-nearby';

export const loader = async ({ request }: Route.LoaderArgs) => {
    const url = new URL(request.url);
    const latitude = Number(url.searchParams.get('latitude'));
    const longitude = Number(url.searchParams.get('longitude'));
    const rangeInMetres = Number(url.searchParams.get('rangeInMetres'));

    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        !Number.isFinite(rangeInMetres)
    ) {
        throw data('latitude, longitude, and rangeInMetres are required.', { status: 400 });
    }

    const breweries = await getBreweryLocationsNearby(latitude, longitude, rangeInMetres);
    return { breweries };
};
