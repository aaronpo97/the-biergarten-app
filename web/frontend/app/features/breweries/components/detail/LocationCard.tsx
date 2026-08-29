import { lazy, Suspense } from 'react';
import ClientOnly from '../../../../components/ClientOnly';
import SidebarCard from '../shared/SidebarCard';
import { formatBreweryAddress } from '../../utils/format-address';
import type { BreweryLocation } from '../../breweries.server';

const BreweryLocationMap = lazy(() => import('./BreweryLocationMap'));

interface LocationCardProps {
    breweryName: string;
    location: BreweryLocation;
    website: string;
}

const MAP_PLACEHOLDER_CLASS = 'skeleton h-45 w-full rounded-field';

const LocationCard = ({ breweryName, location, website }: LocationCardProps) => (
    <SidebarCard title="Location">
        {location.coordinates && (
            <ClientOnly fallback={<div className={MAP_PLACEHOLDER_CLASS} />}>
                {() => (
                    <Suspense fallback={<div className={MAP_PLACEHOLDER_CLASS} />}>
                        <BreweryLocationMap
                            latitude={location.coordinates!.latitude}
                            longitude={location.coordinates!.longitude}
                            label={`${breweryName} — ${location.addressLine1}`}
                        />
                    </Suspense>
                )}
            </ClientOnly>
        )}
        <p className="text-sm leading-relaxed m-0">{formatBreweryAddress(location)}</p>
        <p className="text-sm m-0">
            <a
                href={`https://${website}`}
                className="link link-primary"
                target="_blank"
                rel="noreferrer"
            >
                {website}
            </a>
        </p>
    </SidebarCard>
);

export default LocationCard;
