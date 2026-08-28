import { Heart, HeartSolid, MapPin } from 'iconoir-react';
import StarRating from './StarRating';
import { formatBreweryAddress } from '../utils/format-address';
import type { Brewery } from '../breweries.server';

interface BreweryHeaderCardProps {
    brewery: Brewery;
    foundedYear: number;
    liked: boolean;
    likeCount: number;
    avgRating: number;
    ratingsCount: number;
    onToggleLike: () => void;
}

const BreweryHeaderCard = ({
    brewery,
    foundedYear,
    liked,
    likeCount,
    avgRating,
    ratingsCount,
    onToggleLike,
}: BreweryHeaderCardProps) => (
    <div className="card bg-base-100 shadow">
        <div className="card-body gap-4 p-7">
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-widest text-base-content/50">
                        Brewery
                    </span>
                    <span className="badge bg-[var(--color-highlight)] text-[var(--color-highlight-content)]">
                        Est. {foundedYear}
                    </span>
                </div>
                <h1 className="text-4xl leading-tight m-0">{brewery.breweryName}</h1>
                {brewery.location && (
                    <p className="text-sm text-base-content/60 flex items-center gap-1 m-0">
                        <MapPin className="size-4" aria-hidden="true" />
                        {formatBreweryAddress(brewery.location)}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
                <button
                    type="button"
                    onClick={onToggleLike}
                    className={`btn btn-sm ${liked ? 'btn-primary' : 'btn-outline'}`}
                >
                    {liked ? (
                        <HeartSolid className="size-4" aria-hidden="true" />
                    ) : (
                        <Heart className="size-4" aria-hidden="true" />
                    )}
                    {liked ? 'Liked' : 'Like'} · {likeCount}
                </button>
                <div className="flex items-baseline gap-1.5">
                    <StarRating value={avgRating} size="sm" />
                    <span className="font-bold">{avgRating.toFixed(1)}</span>
                    <span className="text-sm text-base-content/60">({ratingsCount} ratings)</span>
                </div>
            </div>
            <p className="text-base-content/70 leading-relaxed text-pretty m-0">
                {brewery.description}
            </p>
        </div>
    </div>
);

export default BreweryHeaderCard;
