import RouteErrorState from '../../../components/ui/error/RouteErrorState';
import ClientOnly from '../../../components/ClientOnly';
import BreweryCard from '../components/BreweryCard';
import { getBreweries, getBreweryLocations, type SimplifiedBrewery } from '../breweries.server';
import type { Route } from './+types/breweries';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useFetcher } from 'react-router';
import type { BreweryMapPin } from '../components/BreweryMap';

const PAGE_SIZE = 12;
const MAP_PLACEHOLDER_CLASS = 'h-[28rem] md:h-[34rem] w-full rounded-box bg-base-300';

export const meta = ({}: Route.MetaArgs) => {
    return [{ title: 'Breweries | The Biergarten App' }];
};

export const loader = async ({ request }: Route.LoaderArgs) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get('limit')) || PAGE_SIZE;
    const offset = Number(url.searchParams.get('offset')) || 0;
    const [breweries, locations] = await Promise.all([
        getBreweries(limit, offset),
        getBreweryLocations(),
    ]);
    return { breweries, locations, limit, offset };
};

const BreweryMap = lazy(() => import('../components/BreweryMap'));

const toPins = (breweries: SimplifiedBrewery[]): BreweryMapPin[] =>
    breweries
        .filter((brewery) => brewery.location?.coordinates)
        .map((brewery) => ({
            id: brewery.breweryPostId,
            name: brewery.breweryName,
            latitude: brewery.location!.coordinates!.latitude,
            longitude: brewery.location!.coordinates!.longitude,
            location: brewery.location,
        }));

const Breweries = ({ loaderData }: Route.ComponentProps) => {
    const [allBreweries, setAllBreweries] = useState(loaderData.breweries);
    const [offset, setOffset] = useState(loaderData.breweries.length);
    const [hasMore, setHasMore] = useState(loaderData.breweries.length === loaderData.limit);
    const [loadedPage, setLoadedPage] = useState<typeof loaderData | undefined>(undefined);
    const fetcher = useFetcher<typeof loader>();
    const sentinelRef = useRef<HTMLDivElement>(null);

    if (fetcher.data && fetcher.data !== loadedPage) {
        setLoadedPage(fetcher.data);
        setAllBreweries((prev) => [...prev, ...fetcher.data!.breweries]);
        setOffset((prev) => prev + fetcher.data!.breweries.length);
        setHasMore(fetcher.data.breweries.length === PAGE_SIZE);
    }

    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel || !hasMore) return;

        const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting && fetcher.state === 'idle') {
                fetcher.load(`/breweries?limit=${PAGE_SIZE}&offset=${offset}`);
            }
        });

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, offset, fetcher]);

    const pins = toPins(loaderData.locations);

    return (
        <div className="min-h-screen bg-base-200">
            <div className="container mx-auto p-14">
                <h1 className="text-4xl font-bold mb-4">Breweries</h1>
                <p className="text-base-content/70 mb-6">Discover our partner breweries.</p>

                <ClientOnly fallback={<div className={MAP_PLACEHOLDER_CLASS} />}>
                    {() => (
                        <Suspense fallback={<div className={MAP_PLACEHOLDER_CLASS} />}>
                            <BreweryMap breweries={pins} />
                        </Suspense>
                    )}
                </ClientOnly>

                {allBreweries.length === 0 ? (
                    <p className="text-center text-base-content/60 mt-12">
                        No breweries found yet.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                        {allBreweries.map((brewery) => (
                            <BreweryCard key={brewery.breweryPostId} brewery={brewery} />
                        ))}
                        {fetcher.state !== 'idle' &&
                            Array.from({ length: PAGE_SIZE }).map((_, index) => (
                                <div
                                    key={index}
                                    className="skeleton h-32 w-full rounded-box"
                                />
                            ))}
                    </div>
                )}

                {hasMore && <div ref={sentinelRef} className="h-1" />}
            </div>
        </div>
    );
};

export default Breweries;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => (
    <RouteErrorState error={error} />
);
