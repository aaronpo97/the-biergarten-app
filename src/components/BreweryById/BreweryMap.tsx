import useMediaQuery from '@/hooks/useMediaQuery';

import { FC } from 'react';
import Map, { Marker } from 'react-map-gl';

interface BreweryMapProps {
  latitude: number;
  longitude: number;
}
const BreweryMap: FC<BreweryMapProps> = ({ latitude, longitude }) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const theme =
    typeof window !== 'undefined' ? window.localStorage.getItem('theme') : 'dark';

  const mapStyle =
    theme === 'dark'
      ? 'mapbox://styles/mapbox/dark-v11'
      : 'mapbox://styles/mapbox/light-v10';
  return (
    <div className="card">
      <div className="card-body">
        <Map
          initialViewState={{
            latitude,
            longitude,
            zoom: 17,
          }}
          style={{
            width: '100%',
            height: isDesktop ? 400 : 200,
          }}
          mapStyle={mapStyle}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN as string}
          scrollZoom={true}
        >
          <Marker latitude={latitude} longitude={longitude} />
        </Map>
      </div>
    </div>
  );
};

export default BreweryMap;
