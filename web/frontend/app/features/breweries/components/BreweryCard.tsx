import { Link } from 'react-router';
import type { Brewery } from '../breweries.server';

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
            <p className="text-base-content/70 line-clamp-3">{brewery.description}</p>
            {brewery.location && (
                <p className="text-sm text-base-content/50 mt-2">
                    {brewery.location.addressLine1}
                    {brewery.location.addressLine2 ? `, ${brewery.location.addressLine2}` : ''}
                </p>
            )}
        </div>
    </Link>
);

export default BreweryCard;
