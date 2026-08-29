import type { SimplifiedBrewery } from '../../../../breweries.server';
import { formatDistance, type DistanceUnit } from '../../../../utils/distance';

// Notes aren't tracked on brewery locations yet - see BREWERY_HANDOFF.md.
const FILLER_NOTE = 'A stop worth the detour.';

const cardClassName = (selected: boolean) =>
    `card card-sm card-border bg-base-100 text-left shadow transition-shadow hover:shadow-lg ${
        selected ? 'border-2 border-primary' : ''
    }`;

interface NearbyBreweryListItemProps {
    brewery: SimplifiedBrewery;
    distanceMetres: number;
    unit: DistanceUnit;
    selected: boolean;
    onSelect: (id: string) => void;
}

const NearbyBreweryListItem = ({
    brewery,
    distanceMetres,
    unit,
    selected,
    onSelect,
}: NearbyBreweryListItemProps) => (
    <button
        type="button"
        onClick={() => onSelect(brewery.breweryPostId)}
        className={cardClassName(selected)}
    >
        <div className="card-body">
            <div className="flex justify-between items-baseline gap-3">
                <h3 className="card-title font-serif text-lg">{brewery.breweryName}</h3>
                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                    {formatDistance(distanceMetres, unit)}
                </span>
            </div>
            {brewery.location && (
                <div className="text-sm text-base-content/60">
                    {brewery.location.cityName}, {brewery.location.stateProvinceCode}
                </div>
            )}
            <div className="text-sm mt-2">{FILLER_NOTE}</div>
        </div>
    </button>
);

export default NearbyBreweryListItem;
