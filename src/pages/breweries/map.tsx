import { NextPage } from 'next';
import { useEffect, useMemo, useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

import LocationMarker from '@/components/ui/LocationMarker';
import Link from 'next/link';
import Head from 'next/head';
import useGeolocation from '@/hooks/utilities/useGeolocation';
import BreweryPostMapQueryResult from '@/services/BreweryPost/schema/BreweryPostMapQueryResult';
import { z } from 'zod';
import useBreweryMapPagePosts from '@/hooks/data-fetching/brewery-posts/useBreweryMapPagePosts';
import ControlPanel from '@/components/ui/maps/ControlPanel';

type MapStyles = Record<'light' | 'dark', `mapbox://styles/mapbox/${string}`>;

const BreweryMapPage: NextPage = () => {
  const [popupInfo, setPopupInfo] = useState<z.infer<
    typeof BreweryPostMapQueryResult
  > | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    setTheme(localStorage.getItem('theme') === 'dark' ? 'dark' : 'light');
  }, []);

  const { breweries } = useBreweryMapPagePosts({ pageSize: 50 });

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
              key={brewery.id}
              latitude={latitude}
              longitude={longitude}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setPopupInfo(brewery);
              }}
            >
              <LocationMarker size="md" color="blue" />
            </Marker>
          );
        })}
      </>
    ),
    [breweries],
  );

  const { coords, error: geoError } = useGeolocation();

  const userLocationPin = useMemo(
    () =>
      coords && !geoError ? (
        <Marker latitude={coords.latitude} longitude={coords.longitude}>
          <LocationMarker size="lg" color="red" />
        </Marker>
      ) : null,
    [coords, geoError],
  );

  return (
    <>
      <Head>
        <title>Brewery Map | The Biergarten App</title>
        <meta
          name="description"
          content="Find breweries near you and around the world."
        />
      </Head>
      <div className="h-full">
        <Map
          // center the map on North America
          initialViewState={{ zoom: 3, latitude: 48.3544, longitude: -99.9981 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapStyles[theme]}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
          scrollZoom
        >
          <ControlPanel />
          {pins}
          {userLocationPin}
          {popupInfo && (
            <Popup
              anchor="bottom"
              longitude={popupInfo.location.coordinates[0]}
              latitude={popupInfo.location.coordinates[1]}
              onClose={() => setPopupInfo(null)}
            >
              <div className="flex flex-col text-black">
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
    </>
  );
};

export default BreweryMapPage;
