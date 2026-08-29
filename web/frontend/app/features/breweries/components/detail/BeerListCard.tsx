import { Link } from 'react-router';
import StarRating from '../shared/StarRating';
import type { FillerBeer } from '../../utils/filler-brewery-detail';

interface BeerListCardProps {
    beers: FillerBeer[];
}

const BeerListCard = ({ beers }: BeerListCardProps) => (
    <div className="card bg-base-100 shadow">
        <div className="card-body gap-3 p-6">
            <div className="flex items-baseline justify-between gap-4">
                <h3 className="text-xl m-0">Beers ({beers.length})</h3>
                <Link to="/beers" className="link link-primary text-sm">
                    View all beers
                </Link>
            </div>
            <div className="flex flex-col">
                {beers.map((beer) => (
                    <div
                        key={beer.id}
                        className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-3 py-2.5 border-t border-base-content/10 first:border-t-0"
                    >
                        <div className="flex flex-col gap-0.5 min-w-0">
                            <span className="font-bold text-sm">{beer.name}</span>
                            <span className="text-xs text-base-content/60">{beer.description}</span>
                        </div>
                        <span className="badge badge-ghost bg-base-300 text-xs font-semibold whitespace-nowrap">
                            {beer.style}
                        </span>
                        <span className="text-xs text-base-content/60 tabular-nums whitespace-nowrap">
                            {beer.abv.toFixed(1)}% ABV
                        </span>
                        <StarRating value={beer.rating} size="xs" />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default BeerListCard;
