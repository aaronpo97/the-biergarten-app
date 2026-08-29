import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L, { type LatLngTuple } from 'leaflet';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

interface BreweryLocationMapProps {
    latitude: number;
    longitude: number;
    label: string;
}

const ZOOM = 15;

const BreweryLocationMap = ({ latitude, longitude, label }: BreweryLocationMapProps) => {
    const position: LatLngTuple = [latitude, longitude];

    return (
        <MapContainer
            center={position}
            zoom={ZOOM}
            scrollWheelZoom={false}
            className="h-45 w-full rounded-field relative z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                noWrap
            />
            <Marker position={position}>
                <Popup>{label}</Popup>
            </Marker>
        </MapContainer>
    );
};

export default BreweryLocationMap;
