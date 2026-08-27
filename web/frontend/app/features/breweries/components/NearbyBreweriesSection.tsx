import { lazy, Suspense, useEffect, useState } from 'react';
import { useFetcher } from 'react-router';
import type { LatLngTuple } from 'leaflet';
import ClientOnly from '../../../components/ClientOnly';
import type { SimplifiedBrewery } from '../breweries.server';
import type { loader as nearbyLoader } from '../routes/breweries-nearby';
import { formatDistance, haversineDistanceMetres } from '../utils/distance';
import type { NearbyMapPin } from './NearbyBreweryMap';

const NearbyBreweryMap = lazy(() => import('./NearbyBreweryMap'));

const MAP_PLACEHOLDER_CLASS = 'min-h-[30rem] h-full w-full rounded-box bg-base-300';
const DEFAULT_RADIUS_KM = 120;
const MIN_RADIUS_KM = 10;
const MAX_RADIUS_KM = 150;
const RADIUS_STEP_KM = 10;

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

// Notes aren't tracked on brewery locations yet - see BREWERY_INDEX_HANDOFF.md.
const FILLER_NOTE = 'A stop worth the detour.';

const cardClassName = (selected: boolean) =>
    `text-left rounded-box bg-base-100 shadow p-4 cursor-pointer transition-shadow hover:shadow-lg border-l-4 ${
        selected ? 'border-l-primary' : 'border-l-transparent'
    }`;

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
        userLocation ?? (geoAttempted && fallbackCenter ? [fallbackCenter.latitude, fallbackCenter.longitude] : null);
    const centerLabel = userLocation ? locationLabel : (fallbackCenter?.label ?? locationLabel);

    useEffect(() => {
        if (!center) return;
        fetcher.load(
            `/breweries/nearby?latitude=${center[0]}&longitude=${center[1]}&rangeInMetres=${radiusKm * 1000}`,
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [center?.[0], center?.[1], radiusKm]);

    const nearby: SimplifiedBrewery[] = fetcher.data?.breweries ?? [];
    const withDistance = center
        ? nearby
              .filter((b) => b.location?.coordinates)
              .map((b) => ({
                  brewery: b,
                  distanceMetres: haversineDistanceMetres(
                      { latitude: center[0], longitude: center[1] },
                      b.location!.coordinates!,
                  ),
              }))
              .sort((a, b) => a.distanceMetres - b.distanceMetres)
        : [];

    const pins: NearbyMapPin[] = withDistance.map(({ brewery }) => ({
        id: brewery.breweryPostId,
        name: brewery.breweryName,
        cityLabel: brewery.location ? `${brewery.location.cityName}, ${brewery.location.stateProvinceCode}` : null,
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
            <div className="flex items-baseline justify-between gap-4 flex-wrap mb-3.5">
                <h2 className="font-serif text-2xl m-0">Breweries near you</h2>
                <span className="text-sm text-base-content/60">
                    {center
                        ? `${withDistance.length} within ${radiusKm} km of ${centerLabel}`
                        : 'Finding breweries near you…'}
                </span>
            </div>

            <div className="grid gap-5 items-stretch md:grid-cols-[22rem_1fr]">
                <div className="flex flex-col gap-3 order-2 md:order-1">
                    <label className="flex flex-col gap-1 text-sm text-base-content/70">
                        <span className="flex justify-between">
                            <span>Search radius</span>
                            <span className="font-semibold">{radiusKm} km</span>
                        </span>
                        <input
                            type="range"
                            min={MIN_RADIUS_KM}
                            max={MAX_RADIUS_KM}
                            step={RADIUS_STEP_KM}
                            value={radiusKm}
                            onChange={(e) => setRadiusKm(Number(e.target.value))}
                            className="range range-primary range-sm"
                        />
                    </label>
                    {withDistance.length === 0 && center && (
                        <p className="text-sm text-base-content/60">
                            No partner breweries within {radiusKm} km.
                        </p>
                    )}
                    {withDistance.map(({ brewery, distanceMetres }) => (
                        <button
                            key={brewery.breweryPostId}
                            type="button"
                            onClick={() => onSelect(brewery.breweryPostId)}
                            className={cardClassName(selectedId === brewery.breweryPostId)}
                        >
                            <div className="flex justify-between items-baseline gap-3">
                                <h3 className="font-serif text-lg m-0">{brewery.breweryName}</h3>
                                <span className="text-sm font-semibold text-primary whitespace-nowrap">
                                    {formatDistance(distanceMetres)}
                                </span>
                            </div>
                            {brewery.location && (
                                <div className="text-sm text-base-content/60 mt-1">
                                    {brewery.location.cityName}, {brewery.location.stateProvinceCode}
                                </div>
                            )}
                            <div className="text-sm mt-2">{FILLER_NOTE}</div>
                        </button>
                    ))}
                    <div className="pt-1">
                        <button type="button" onClick={requestGeolocation} className="btn btn-ghost btn-sm">
                            Change location
                        </button>
                    </div>
                </div>

                <div className="order-1 md:order-2">
                    <ClientOnly fallback={<div className={MAP_PLACEHOLDER_CLASS} />}>
                        {() =>
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
                    </ClientOnly>
                </div>
            </div>
        </section>
    );
};

export default NearbyBreweriesSection;
