import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import L, { type LatLngTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_ZOOM = 11;
const MIN_ZOOM = 8;

export interface NearbyMapPin {
    id: string;
    name: string;
    cityLabel: string | null;
    latitude: number;
    longitude: number;
}

interface NearbyBreweryMapProps {
    pins: NearbyMapPin[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    userLocation: LatLngTuple | null;
    userLocationLabel: string;
}

// Leaflet paints markers as SVG attributes, which can't reference CSS custom
// properties the way class names can - resolve the current theme's colors instead.
const resolveThemeColor = (variable: string, fallback: string) => {
    if (typeof document === 'undefined') return fallback;
    const value = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
    return value || fallback;
};

const pinIcon = (active: boolean) =>
    L.divIcon({
        className: '',
        html: `<span class="block h-[18px] w-[18px] rounded-full border-[3px] border-base-100 shadow-[0_1px_4px_rgba(0,0,0,.35)] ${
            active ? 'bg-secondary scale-125' : 'bg-primary'
        }"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
    });

const FitAndFocus = ({
    pins,
    userLocation,
    selectedId,
}: {
    pins: NearbyMapPin[];
    userLocation: LatLngTuple | null;
    selectedId: string | null;
}) => {
    const map = useMap();
    const didInitialFit = useRef(false);

    useEffect(() => {
        if (didInitialFit.current) return;
        const focus: LatLngTuple | null =
            userLocation ?? (pins[0] ? [pins[0].latitude, pins[0].longitude] : null);
        if (focus) {
            map.setView(focus, DEFAULT_ZOOM, { animate: false });
            didInitialFit.current = true;
        }
        const timeout = setTimeout(() => map.invalidateSize(), 200);
        return () => clearTimeout(timeout);
    }, [map, pins, userLocation]);

    useEffect(() => {
        if (!didInitialFit.current || !selectedId) return;
        const pin = pins.find((p) => p.id === selectedId);
        if (!pin) return;
        map.flyTo([pin.latitude, pin.longitude], Math.max(map.getZoom(), 11), { duration: 0.8 });
    }, [map, pins, selectedId]);

    return null;
};

const RecenterButton = ({ userLocation }: { userLocation: LatLngTuple | null }) => {
    const map = useMap();
    if (!userLocation) return null;
    return (
        <button
            type="button"
            onClick={() => map.setView(userLocation, DEFAULT_ZOOM, { animate: true })}
            className="btn btn-circle btn-sm bg-base-100 absolute top-2.5 right-2.5 z-[1000] shadow"
            aria-label="Recenter on your location"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
            >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
            </svg>
        </button>
    );
};

const NearbyBreweryMap = ({
    pins,
    selectedId,
    onSelect,
    userLocation,
    userLocationLabel,
}: NearbyBreweryMapProps) => (
    <MapContainer
        center={userLocation ?? [pins[0]?.latitude ?? 20, pins[0]?.longitude ?? 0]}
        zoom={DEFAULT_ZOOM}
        minZoom={MIN_ZOOM}
        scrollWheelZoom={false}
        className="min-h-[30rem] h-full w-full rounded-box relative z-0"
    >
        <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitAndFocus pins={pins} userLocation={userLocation} selectedId={selectedId} />
        <RecenterButton userLocation={userLocation} />
        {userLocation && (
            <CircleMarker
                center={userLocation}
                radius={6}
                pathOptions={{
                    color: resolveThemeColor('--color-base-100', '#fff'),
                    weight: 2,
                    fillColor: resolveThemeColor('--color-primary', '#2b6cb0'),
                    fillOpacity: 1,
                }}
            >
                <Popup>You are here &mdash; {userLocationLabel}</Popup>
            </CircleMarker>
        )}
        {pins.map((pin) => (
            <Marker
                key={pin.id}
                position={[pin.latitude, pin.longitude]}
                icon={pinIcon(pin.id === selectedId)}
                eventHandlers={{ click: () => onSelect(pin.id) }}
            >
                <Popup>
                    <p className="font-semibold font-serif">{pin.name}</p>
                    {pin.cityLabel && (
                        <p className="text-sm text-base-content/70">{pin.cityLabel}</p>
                    )}
                    <a href={`/breweries/${pin.id}`} className="link link-primary text-sm">
                        View brewery &rarr;
                    </a>
                </Popup>
            </Marker>
        ))}
    </MapContainer>
);

export default NearbyBreweryMap;
