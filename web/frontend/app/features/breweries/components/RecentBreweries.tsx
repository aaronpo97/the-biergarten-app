import { Link } from 'react-router';
import type { Brewery } from '../breweries.server';

interface RecentBreweriesProps {
    breweries: Brewery[];
}

const RecentBreweries = ({ breweries }: RecentBreweriesProps) => {
    if (breweries.length === 0) return null;

    return (
        <section className="max-w-7xl mx-auto px-5 pt-11">
            <h2 className="font-serif text-2xl mb-3.5">Recently added</h2>
            <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(15rem,1fr))]">
                {breweries.map((brewery) => (
                    <div
                        key={brewery.breweryPostId}
                        className="card bg-base-100 shadow p-6 flex flex-col gap-1.5"
                    >
                        <h3 className="font-serif text-xl m-0">{brewery.breweryName}</h3>
                        {brewery.location && (
                            <div className="text-sm text-base-content/60">
                                {brewery.location.cityName}, {brewery.location.stateProvinceCode}
                            </div>
                        )}
                        <p className="text-sm leading-snug mt-1 line-clamp-2">
                            {brewery.description}
                        </p>
                        <Link
                            to={`/breweries/${brewery.breweryPostId}`}
                            className="link link-hover text-sm font-semibold text-secondary hover:text-primary mt-2"
                        >
                            View brewery &rarr;
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RecentBreweries;
