import useMediaQuery from '@/hooks/useMediaQuery';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FC, useMemo } from 'react';
import Map, { Marker } from 'react-map-gl';

import LocationMarker from '../ui/LocationMarker';

interface BreweryMapProps {
  latitude: number;
  longitude: number;
}
type MapStyles = Record<'light' | 'dark', `mapbox://styles/mapbox/${string}`>;

const BreweryPostMap: FC<BreweryMapProps> = ({ latitude, longitude }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  const windowIsDefined = typeof window !== 'undefined';
  const themeIsDefined = windowIsDefined && !!window.localStorage.getItem('theme');

  const theme = (
    windowIsDefined && themeIsDefined ? window.localStorage.getItem('theme') : 'light'
  ) as 'light' | 'dark';

  const pin = useMemo(
    () => (
      <Marker latitude={latitude} longitude={longitude}>
        <LocationMarker />
      </Marker>
    ),
    [latitude, longitude],
  );

  const mapStyles: MapStyles = {
    light: 'mapbox://styles/mapbox/light-v10',
    dark: 'mapbox://styles/mapbox/dark-v11',
  };

  return (
    <div className="card">
      <div className="card-body">
        <Map
          initialViewState={{ latitude, longitude, zoom: 17 }}
          style={{ width: '100%', height: isDesktop ? 480 : 240 }}
          mapStyle={mapStyles[theme]}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string}
          scrollZoom
        >
          {pin}
        </Map>
      </div>
    </div>
  );
};

export default BreweryPostMap;
