import useMediaQuery from '@/hooks/utilities/useMediaQuery';
import 'mapbox-gl/dist/mapbox-gl.css';
import { FC, useMemo } from 'react';
import Map, { Marker } from 'react-map-gl';

import LocationMarker from '../ui/LocationMarker';
import ControlPanel from '../ui/maps/ControlPanel';

interface BreweryMapProps {
  coordinates: { latitude: number; longitude: number };
  token: string;
}
type MapStyles = Record<'light' | 'dark', `mapbox://styles/mapbox/${string}`>;

const BreweryPostMap: FC<BreweryMapProps> = ({
  coordinates: { latitude, longitude },
  token,
}) => {
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
          mapboxAccessToken={token}
          scrollZoom
        >
          <ControlPanel />
          {pin}
        </Map>
      </div>
    </div>
  );
};

export default BreweryPostMap;
