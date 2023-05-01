import { GetServerSideProps, NextPage } from 'next';
import { useMemo, useState } from 'react';
import Map, {
  FullscreenControl,
  Marker,
  NavigationControl,
  Popup,
  ScaleControl,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import DBClient from '@/prisma/DBClient';

import LocationMarker from '@/components/ui/LocationMarker';
import Link from 'next/link';

type MapStyles = Record<'light' | 'dark', `mapbox://styles/mapbox/${string}`>;

interface BreweryMapPageProps {
  breweries: {
    location: {
      city: string;
      stateOrProvince: string | null;
      country: string | null;
      coordinates: number[];
    };
    id: string;
    name: string;
  }[];
}

const BreweryMapPage: NextPage<BreweryMapPageProps> = ({ breweries }) => {
  const windowIsDefined = typeof window !== 'undefined';
  const themeIsDefined = windowIsDefined && !!window.localStorage.getItem('theme');

  const [popupInfo, setPopupInfo] = useState<BreweryMapPageProps['breweries'][0] | null>(
    null,
  );

  const theme = (
    windowIsDefined && themeIsDefined ? window.localStorage.getItem('theme') : 'light'
  ) as 'light' | 'dark';

  const mapStyles: MapStyles = {
    light: 'mapbox://styles/mapbox/light-v10',
    dark: 'mapbox://styles/mapbox/dark-v11',
  };

  const pins = useMemo(
    () => (
      <>
        {breweries.map((brewery) => {
          const [longitude, latitude] = brewery.location.coordinates;
          return (
            <Marker
              latitude={latitude}
              longitude={longitude}
              key={brewery.id}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(brewery);
              }}
            >
              <LocationMarker />
            </Marker>
          );
        })}
      </>
    ),
    [breweries],
  );
  return (
    <div className="h-full">
      <Map
        initialViewState={{ zoom: 2 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyles[theme]}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
        scrollZoom
      >
        <FullscreenControl position="top-left" />
        <NavigationControl position="top-left" />
        <ScaleControl />
        {pins}
        {popupInfo && (
          <Popup
            anchor="bottom"
            longitude={popupInfo.location.coordinates[0]}
            latitude={popupInfo.location.coordinates[1]}
            onClose={() => setPopupInfo(null)}
          >
            <div className="flex flex-col text-black ">
              <Link
                className="link-hover link text-base font-bold"
                href={`/breweries/${popupInfo.id}`}
              >
                {popupInfo.name}
              </Link>
              <p className="text-base">
                {popupInfo.location.city}
                {popupInfo.location.stateOrProvince
                  ? `, ${popupInfo.location.stateOrProvince}`
                  : ''}
                {popupInfo.location.country ? `, ${popupInfo.location.country}` : ''}
              </p>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
};

export default BreweryMapPage;

export const getServerSideProps: GetServerSideProps<BreweryMapPageProps> = async () => {
  const breweries = await DBClient.instance.breweryPost.findMany({
    select: {
      location: {
        select: { coordinates: true, city: true, country: true, stateOrProvince: true },
      },
      id: true,
      name: true,
    },
  });

  return { props: { breweries } };
};
