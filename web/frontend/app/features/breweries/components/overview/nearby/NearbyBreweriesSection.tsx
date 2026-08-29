import { lazy, Suspense, useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import type { LatLngTuple } from 'leaflet';
import useDebouncedValue from '../../../../../hooks/useDebouncedValue';
import type { SimplifiedBrewery } from '../../../breweries.server';
import type { loader as nearbyLoader } from '../../../routes/resources/breweries-nearby';
import type { DistanceUnit } from '../../../utils/distance';
import ChangeLocationButton from './controls/ChangeLocationButton';
import RadiusUnitControls from './controls/RadiusUnitControls';
import NearbyBreweriesHeader from './header/NearbyBreweriesHeader';
import NearbyBreweryList from './list/NearbyBreweryList';
import ClientOnlyMap, { MAP_PLACEHOLDER_CLASS } from './map/ClientOnlyMap';
import type { NearbyMapPin } from './map/NearbyBreweryMap';

const NearbyBreweryMap = lazy(() => import('./map/NearbyBreweryMap'));

const DEFAULT_RADIUS_KM = 120;
const RADIUS_DEBOUNCE_MS = 300;

export interface FeaturedPin {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
}

interface FallbackCenter {
    latitude: number;
    longitude: number;
    label: string;
}

interface NearbyBreweriesSectionProps {
    featured: FeaturedPin | null;
    fallbackCenter: FallbackCenter | null;
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const NearbyBreweriesSection = ({
    featured,
    fallbackCenter,
    selectedId,
    onSelect,
}: NearbyBreweriesSectionProps) => {
    const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
    const [locationLabel, setLocationLabel] = useState('your location');
    const [geoAttempted, setGeoAttempted] = useState(false);
    const [radiusKm, setRadiusKm] = useState(DEFAULT_RADIUS_KM);
    const debouncedRadiusKm = useDebouncedValue(radiusKm, RADIUS_DEBOUNCE_MS);
    const [unit, setUnit] = useState<DistanceUnit>('km');
    const fetcher = useFetcher<typeof nearbyLoader>();

    const requestGeolocation = () => {
        if (!navigator.geolocation) {
            Promise.resolve().then(() => setGeoAttempted(true));
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude]);
                setLocationLabel('your location');
                setGeoAttempted(true);
            },
            () => setGeoAttempted(true),
            { enableHighAccuracy: true },
        );
    };

    useEffect(() => {
        requestGeolocation();
    }, []);

    const center: LatLngTuple | null =
        userLocation ??
        (geoAttempted && fallbackCenter
            ? [fallbackCenter.latitude, fallbackCenter.longitude]
            : null);
    const centerLabel = userLocation ? locationLabel : (fallbackCenter?.label ?? locationLabel);

    useEffect(() => {
        if (!center) return;
        fetcher.load(
            `/breweries/nearby?latitude=${center[0]}&longitude=${center[1]}&rangeInMetres=${debouncedRadiusKm * 1000}`,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [center?.[0], center?.[1], debouncedRadiusKm]);

    const nearby: SimplifiedBrewery[] = fetcher.data?.breweries ?? [];
    const withDistance = center
        ? nearby
              .filter((b) => b.location?.coordinates && b.distanceMetres !== null)
              .map((b) => ({
                  brewery: b,
                  distanceMetres: b.distanceMetres as number,
              }))
              .sort((a, b) => a.distanceMetres - b.distanceMetres)
        : [];

    const pins: NearbyMapPin[] = withDistance.map(({ brewery }) => ({
        id: brewery.breweryPostId,
        name: brewery.breweryName,
        cityLabel: brewery.location
            ? `${brewery.location.cityName}, ${brewery.location.stateProvinceCode}`
            : null,
        latitude: brewery.location!.coordinates!.latitude,
        longitude: brewery.location!.coordinates!.longitude,
    }));
    if (featured && !pins.some((p) => p.id === featured.id)) {
        pins.push({
            id: featured.id,
            name: featured.name,
            cityLabel: null,
            latitude: featured.latitude,
            longitude: featured.longitude,
        });
    }

    return (
        <section id="breweries-near-you" className="max-w-7xl mx-auto px-5 pt-11">
            <NearbyBreweriesHeader
                center={center}
                withDistance={withDistance}
                radiusKm={radiusKm}
                unit={unit}
                centerLabel={centerLabel}
            />

            <div className="grid gap-5 items-stretch md:grid-cols-[22rem_1fr]">
                <div className="flex flex-col gap-3 order-2 md:order-1">
                    <RadiusUnitControls
                        radiusKm={radiusKm}
                        unit={unit}
                        onRadiusChange={(e) => setRadiusKm(Number(e.target.value))}
                        onSelectKm={() => setUnit('km')}
                        onSelectMi={() => setUnit('mi')}
                    />
                    <NearbyBreweryList
                        withDistance={withDistance}
                        center={center}
                        radiusKm={radiusKm}
                        unit={unit}
                        selectedId={selectedId}
                        onSelect={onSelect}
                    />
                    <ChangeLocationButton onClick={requestGeolocation} />
                </div>

                <div className="order-1 md:order-2">
                    <ClientOnlyMap
                        render={() =>
                            center ? (
                                <Suspense fallback={<div className={MAP_PLACEHOLDER_CLASS} />}>
                                    <NearbyBreweryMap
                                        pins={pins}
                                        selectedId={selectedId}
                                        onSelect={onSelect}
                                        userLocation={userLocation}
                                        userLocationLabel={centerLabel}
                                    />
                                </Suspense>
                            ) : (
                                <div className={MAP_PLACEHOLDER_CLASS} />
                            )
                        }
                    />
                </div>
            </div>
        </section>
    );
};

export default NearbyBreweriesSection;
