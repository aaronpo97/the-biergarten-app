import { Link } from 'react-router';
import type { Brewery } from '../../breweries/breweries.server';
import { FILLER_BEER_COUNTS } from '../utils/filler-beer-counts';

interface PartnerBreweriesProps {
    breweries: Brewery[];
}

const PartnerBreweries = ({ breweries }: PartnerBreweriesProps) => (
    <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
                <h2 className="m-0 font-serif text-3xl leading-tight">
                    Discover our partner breweries
                </h2>
                <p className="m-0 text-[var(--color-muted)]">
                    A few recent additions to the directory.
                </p>
            </div>

            <Link
                to="/breweries"
                className="font-semibold text-primary hover:text-secondary hover:underline"
            >
                View all breweries &rarr;
            </Link>
        </div>

        {breweries.length === 0 ? (
            <p className="m-0 text-[var(--color-muted)]">No breweries have been posted yet.</p>
        ) : (
            <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))]">
                {breweries.map((brewery, index) => (
                    <div key={brewery.breweryPostId} className="card bg-base-100 shadow-md">
                        <div className="card-body gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <h3 className="card-title m-0 font-serif text-xl">
                                    {brewery.breweryName}
                                </h3>
                                <span className="badge badge-accent badge-sm whitespace-nowrap font-semibold">
                                    {FILLER_BEER_COUNTS[index % FILLER_BEER_COUNTS.length]} beers
                                </span>
                            </div>

                            {brewery.location && (
                                <p className="m-0 text-sm text-[var(--color-muted)]">
                                    {brewery.location.cityName},{' '}
                                    {brewery.location.stateProvinceCode}
                                </p>
                            )}

                            <p className="m-0 leading-[1.55]">{brewery.description}</p>

                            <div className="card-actions">
                                <Link
                                    to={`/breweries/${brewery.breweryPostId}`}
                                    className="btn btn-ghost btn-sm"
                                >
                                    View brewery
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </section>
);

export default PartnerBreweries;
