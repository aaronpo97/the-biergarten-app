import type { LatLngTuple } from 'leaflet';
import { formatDistance, type DistanceUnit } from '../../../../utils/distance';
import type { BreweryWithDistance } from '../types';

interface NearbyBreweriesHeaderProps {
    center: LatLngTuple | null;
    withDistance: BreweryWithDistance[];
    radiusKm: number;
    unit: DistanceUnit;
    centerLabel: string;
}

const NearbyBreweriesHeader = ({
    center,
    centerLabel,
    radiusKm,
    unit,
    withDistance,
}: NearbyBreweriesHeaderProps) => {
    return (
        <div className="flex items-baseline justify-between gap-4 flex-wrap mb-3.5">
            <h2 className="font-serif text-2xl m-0">Breweries near you</h2>
            <span className="text-sm text-base-content/60">
                {center
                    ? `${withDistance.length} within ${formatDistance(radiusKm * 1000, unit)} of ${centerLabel}`
                    : 'Finding breweries near you…'}
            </span>
        </div>
    );
};

export default NearbyBreweriesHeader;
