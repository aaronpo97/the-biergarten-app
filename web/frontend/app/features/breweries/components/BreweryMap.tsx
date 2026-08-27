import { useEffect, useState } from 'react';
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
const WORLD_BOUNDS: LatLngTuple[] = [
    [-90, -180],
    [90, 180],
];

const CURRENT_LOCATION_ICON = L.divIcon({
    className: 'brewery-map-current-location',
    html: '<span class="block h-3.5 w-3.5 rounded-full bg-blue-500 border-2 border-white shadow-md"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const useCurrentLocation = () => {
    const [position, setPosition] = useState<LatLngTuple | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
            () => setPosition(null),
            { enableHighAccuracy: true },
        );
    }, []);

    return position;
};

const CurrentLocationMarker = ({ position }: { position: LatLngTuple }) => (
    <Marker position={position} icon={CURRENT_LOCATION_ICON}>
        <Popup>Your location</Popup>
    </Marker>
);

const CURRENT_LOCATION_ZOOM = 6;

const RecenterMap = ({ bounds, currentLocation }: { bounds: LatLngTuple[]; currentLocation: LatLngTuple | null }) => {
    const map = useMap();

    useEffect(() => {
        if (currentLocation) {
            map.setView(currentLocation, CURRENT_LOCATION_ZOOM);
        } else if (bounds.length > 0) {
            map.fitBounds(bounds, { padding: [32, 32], maxZoom: 6 });
        }
    }, [map, bounds, currentLocation]);

    return null;
};

const BreweryMap = ({ breweries }: BreweryMapProps) => {
    const currentLocation = useCurrentLocation();
    const bounds: LatLngTuple[] = breweries.map((brewery) => [
        brewery.latitude,
        brewery.longitude,
    ]);

    return (
        <MapContainer
            center={currentLocation ?? bounds[0] ?? FALLBACK_CENTER}
            zoom={4}
            scrollWheelZoom={false}
            maxBounds={WORLD_BOUNDS}
            maxBoundsViscosity={1.0}
            worldCopyJump={false}
            className="h-112 md:h-136 w-full rounded-box relative z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                noWrap
            />
            <RecenterMap bounds={bounds} currentLocation={currentLocation} />
            {currentLocation && <CurrentLocationMarker position={currentLocation} />}
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
