import { Link } from 'react-router';
import type { Brewery } from '../../breweries.server';
import { formatBreweryAddress } from '../../utils/format-address';

interface FeaturedBreweryCardProps {
    brewery: Brewery;
    onShowOnMap: () => void;
}

// see BREWERY_HANDOFF.md
const FILLER_STATS = [
    { label: 'Founded', value: '2014' },
    { label: 'Beers listed', value: '18' },
    { label: 'House style', value: 'Seasonal ale' },
];

const FeaturedBreweryCard = ({ brewery, onShowOnMap }: FeaturedBreweryCardProps) => (
    <div className="card bg-base-100 shadow-md rounded-box">
        <div className="card-body gap-3.5 p-8 md:grid md:grid-cols-[1.35fr_1fr] md:gap-10 md:items-start">
            <div className="flex flex-col gap-3.5">
                {brewery.location && (
                    <div className="text-sm font-semibold text-base-content/60">
                        {brewery.location.cityName}, {brewery.location.stateProvinceCode}
                    </div>
                )}
                <h3 className="font-serif text-4xl leading-tight m-0">{brewery.breweryName}</h3>
                <p className="text-lg leading-snug text-pretty m-0">{brewery.description}</p>
                {brewery.location && (
                    <p className="text-sm text-base-content/60 m-0">
                        {formatBreweryAddress(brewery.location)}
                    </p>
                )}
                <div className="flex gap-3 pt-2">
                    <Link to={`/breweries/${brewery.breweryPostId}`} className="btn btn-primary">
                        View brewery
                    </Link>
                    {brewery.location?.coordinates && (
                        <button type="button" onClick={onShowOnMap} className="btn btn-outline">
                            Show on map
                        </button>
                    )}
                </div>
            </div>

            <div className="stats stats-vertical shadow w-full mt-6 md:mt-0">
                {FILLER_STATS.map((stat) => (
                    <div key={stat.label} className="stat">
                        <div className="stat-title text-xs font-bold uppercase tracking-widest">
                            {stat.label}
                        </div>
                        <div className="stat-value font-serif text-2xl">{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default FeaturedBreweryCard;
