/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { User, Location } from '@prisma/client';
import { GeocodeFeature } from '@mapbox/mapbox-sdk/services/geocoding';
import DBClient from '../../DBClient';
import geocode from '../../../config/mapbox/geocoder';

interface CreateNewLocationsArgs {
  numberOfLocations: number;
  joinData: {
    users: User[];
  };
}

const createNewLocations = async ({
  numberOfLocations,
  joinData,
}: CreateNewLocationsArgs) => {
  const prisma = DBClient.instance;

  const locationNames: string[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfLocations; i++) {
    locationNames.push(faker.address.cityName());
  }

  const geocodePromises: Promise<GeocodeFeature>[] = [];

  locationNames.forEach((locationName) => {
    geocodePromises.push(geocode(locationName));
  });

  const geocodedLocations = await Promise.all(geocodePromises);

  const locationPromises: Promise<Location>[] = [];

  geocodedLocations.forEach((geodata) => {
    const city = geodata.text;
    const user = joinData.users[Math.floor(Math.random() * joinData.users.length)];
    const stateOrProvince = geodata.context?.find((c) => c.id.startsWith('region'))?.text;
    const country = geodata.context?.find((c) => c.id.startsWith('country'))?.text;
    const coordinates = geodata.center;
    const address = geodata.place_name;

    locationPromises.push(
      prisma.location.create({
        data: {
          city,
          stateOrProvince,
          country,
          coordinates,
          address,
          postedBy: { connect: { id: user.id } },
        },
      }),
    );
  });

  return Promise.all(locationPromises);
};

export default createNewLocations;
