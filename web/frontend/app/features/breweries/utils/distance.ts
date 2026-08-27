const EARTH_RADIUS_METRES = 6_371_000;

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export const haversineDistanceMetres = (a: Coordinates, b: Coordinates): number => {
    const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
    const deltaLat = toRadians(b.latitude - a.latitude);
    const deltaLng = toRadians(b.longitude - a.longitude);
    const lat1 = toRadians(a.latitude);
    const lat2 = toRadians(b.latitude);

    const h =
        Math.sin(deltaLat / 2) ** 2 +
        Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

    return 2 * EARTH_RADIUS_METRES * Math.asin(Math.sqrt(h));
};

export type DistanceUnit = 'km' | 'mi';

const METRES_PER_MILE = 1609.344;

export const formatDistance = (metres: number, unit: DistanceUnit = 'km'): string => {
    const value = unit === 'mi' ? metres / METRES_PER_MILE : metres / 1000;
    const rounded = value < 10 ? value.toFixed(1) : String(Math.round(value));
    return `${rounded} ${unit}`;
};
