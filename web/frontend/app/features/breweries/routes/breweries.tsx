import { useState } from 'react';
import { Link } from 'react-router';
import RouteErrorState from '../../../components/ui/error/RouteErrorState';
import FeaturedBreweryCard from '../components/FeaturedBreweryCard';
import NearbyBreweriesSection from '../components/NearbyBreweriesSection';
import RecentBreweries from '../components/RecentBreweries';
import { getBreweries } from '../breweries.server';
import type { Route } from './+types/breweries';

// No count endpoint exists yet - see BREWERY_INDEX_HANDOFF.md.
const FILLER_TOTAL_BREWERY_COUNT = 128;

export const meta = ({}: Route.MetaArgs) => {
    return [{ title: 'Breweries | The Biergarten App' }];
};

export const loader = async () => {
    // "Featured" is just the most recently posted brewery for now - see BREWERY_INDEX_HANDOFF.md.
    const [featured, ...recent] = await getBreweries(4, 0);
    return { featured: featured ?? null, recent };
};

const Breweries = ({ loaderData }: Route.ComponentProps) => {
    const { featured, recent } = loaderData;
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const featuredPin =
        featured?.location?.coordinates ?
            {
                id: featured.breweryPostId,
                name: featured.breweryName,
                latitude: featured.location.coordinates.latitude,
                longitude: featured.location.coordinates.longitude,
            }
        :   null;

    const fallbackCenter =
        featured?.location?.coordinates ?
            {
                latitude: featured.location.coordinates.latitude,
                longitude: featured.location.coordinates.longitude,
                label: featured.location.cityName,
            }
        :   null;

    return (
        <div className="min-h-screen bg-base-200 text-base-content pb-16">
            <div className="max-w-7xl mx-auto px-5 pt-10">
                <h1 className="font-serif text-5xl leading-tight mb-2">Breweries</h1>
                <p className="text-lg text-base-content/60 max-w-xl m-0">
                    Discover our partner breweries — start with this week&apos;s feature, then see
                    what&apos;s pouring near you.
                </p>
            </div>

            {featured && (
                <section className="max-w-7xl mx-auto px-5 pt-8">
                    <div className="flex items-baseline gap-3 mb-3.5">
                        <h2 className="font-serif text-2xl m-0">Featured brewery</h2>
                        <span className="badge badge-primary badge-sm uppercase tracking-widest font-bold">
                            This week
                        </span>
                    </div>
                    <FeaturedBreweryCard
                        brewery={featured}
                        onShowOnMap={() => {
                            setSelectedId(featured.breweryPostId);
                            document
                                .getElementById('breweries-near-you')
                                ?.scrollIntoView({ behavior: 'smooth' });
                        }}
                    />
                </section>
            )}

            <NearbyBreweriesSection
                featured={featuredPin}
                fallbackCenter={fallbackCenter}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />

            <RecentBreweries breweries={recent} />

            <section className="max-w-7xl mx-auto px-5 pt-11">
                <div className="bg-[var(--color-highlight)] text-[var(--color-highlight-content)] rounded-box p-7 flex items-center justify-between gap-6 flex-wrap">
                    <div>
                        <h2 className="font-serif text-2xl mb-1">Looking for something specific?</h2>
                        <p className="m-0">
                            All {FILLER_TOTAL_BREWERY_COUNT} partner breweries, filterable by
                            country, region, and beer style.
                        </p>
                    </div>
                    <Link to="/breweries/directory" className="btn btn-primary">
                        Browse the full directory
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default Breweries;

export const ErrorBoundary = ({ error }: Route.ErrorBoundaryProps) => (
    <RouteErrorState error={error} />
);
