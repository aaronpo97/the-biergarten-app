import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding';

import { MAPBOX_ACCESS_TOKEN } from '../env';

const geocoder = mbxGeocoding({ accessToken: MAPBOX_ACCESS_TOKEN });

const geocode = async (query: string) => {
  const geoData = await geocoder.forwardGeocode({ query, limit: 1 }).send();
  return geoData.body.features[0];
};

export default geocode;
