import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L, { type LatLngExpression, type LatLngTuple } from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import useMediaQuery from '../../../hooks/useMediaQuery';
import type { BreweryLocation } from '../breweries.server';
import { formatBreweryAddress } from '../utils/format-address';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

export interface BreweryMapPin {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    location: BreweryLocation | null;
}

interface BreweryMapProps {
    breweries: BreweryMapPin[];
}

const FALLBACK_CENTER: LatLngExpression = [20, 0];

const FitBounds = ({ bounds }: { bounds: LatLngTuple[] }) => {
    const map = useMap();

    useEffect(() => {
        if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [32, 32] });
        }
    }, [map, bounds]);

    return null;
};

const BreweryMap = ({ breweries }: BreweryMapProps) => {
    const bounds: LatLngTuple[] = breweries.map((brewery) => [
        brewery.latitude,
        brewery.longitude,
    ]);

    return (
        <MapContainer
            center={bounds[0] ?? FALLBACK_CENTER}
            zoom={4}
            scrollWheelZoom={false}
            className="h-112 md:h-136 w-full rounded-box relative z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds bounds={bounds} />
            {breweries.map((brewery) => (
                <Marker key={brewery.id} position={[brewery.latitude, brewery.longitude]}>
                    <Popup>
                        <p className="font-semibold">{brewery.name}</p>
                        {brewery.location && (
                            <p className="text-sm text-base-content/70">
                                {formatBreweryAddress(brewery.location)}
                            </p>
                        )}
                        <a href={`/breweries/${brewery.id}`} className="link link-primary text-sm">
                            View brewery &rarr;
                        </a>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default BreweryMap;
