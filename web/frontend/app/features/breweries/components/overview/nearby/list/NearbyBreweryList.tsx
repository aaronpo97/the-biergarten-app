import type { LatLngTuple } from 'leaflet';
import { formatDistance, type DistanceUnit } from '../../../../utils/distance';
import type { BreweryWithDistance } from '../types';
import NearbyBreweryListItem from './NearbyBreweryListItem';

interface NearbyBreweryListProps {
    withDistance: BreweryWithDistance[];
    center: LatLngTuple | null;
    radiusKm: number;
    unit: DistanceUnit;
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const NearbyBreweryList = ({
    withDistance,
    center,
    radiusKm,
    unit,
    selectedId,
    onSelect,
}: NearbyBreweryListProps) => {
    return (
        <>
            {withDistance.length === 0 && center && (
                <p className="text-sm text-base-content/60">
                    No partner breweries within {formatDistance(radiusKm * 1000, unit)}.
                </p>
            )}
            {withDistance.map(({ brewery, distanceMetres }) => (
                <NearbyBreweryListItem
                    key={brewery.breweryPostId}
                    brewery={brewery}
                    distanceMetres={distanceMetres}
                    unit={unit}
                    selected={selectedId === brewery.breweryPostId}
                    onSelect={onSelect}
                />
            ))}
        </>
    );
};

export default NearbyBreweryList;
