export type DistanceUnit = 'km' | 'mi';

const METRES_PER_MILE = 1609.344;

export const formatDistance = (metres: number, unit: DistanceUnit = 'km'): string => {
    const value = unit === 'mi' ? metres / METRES_PER_MILE : metres / 1000;
    const rounded = value < 10 ? value.toFixed(1) : String(Math.round(value));
    return `${rounded} ${unit}`;
};
