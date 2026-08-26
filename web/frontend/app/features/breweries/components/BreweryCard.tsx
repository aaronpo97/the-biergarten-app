import { Link } from 'react-router';
import type { Brewery } from '../breweries.server';
import { formatBreweryAddress } from '../utils/format-address';

interface BreweryCardProps {
    brewery: Brewery;
}

const BreweryCard = ({ brewery }: BreweryCardProps) => (
    <Link
        to={`/breweries/${brewery.breweryPostId}`}
        className="card bg-base-100 shadow hover:shadow-lg transition-shadow"
    >
        <div className="card-body">
            <h2 className="card-title">{brewery.breweryName}</h2>
            {brewery.location && (
                <p className="text-sm font-medium text-base-content/70">
                    {brewery.location.cityName}, {brewery.location.stateProvinceCode}
                </p>
            )}
            {brewery.description && (
                <p className="text-sm leading-5 text-base-content/70 line-clamp-2 max-h-10 overflow-hidden">
                    {brewery.description}
                </p>
            )}
            {brewery.location && (
                <p className="text-sm text-base-content/50 mt-2">
                    {formatBreweryAddress(brewery.location)}
                </p>
            )}
            {brewery.location?.coordinates && (
                <a
                    href={`https://www.openstreetmap.org/?mlat=${brewery.location.coordinates.latitude}&mlon=${brewery.location.coordinates.longitude}#map=16/${brewery.location.coordinates.latitude}/${brewery.location.coordinates.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="link link-primary text-sm mt-2 self-start"
                >
                    View on map &rarr;
                </a>
            )}
        </div>
    </Link>
);

export default BreweryCard;
