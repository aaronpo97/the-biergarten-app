/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { GeocodeFeature } from '@mapbox/mapbox-sdk/services/geocoding';
import DBClient from '../../DBClient';
import geocode from '../../../config/mapbox/geocoder';

interface CreateNewLocationsArgs {
  numberOfLocations: number;
  joinData: {
    users: User[];
  };
}

interface LocationData {
  city: string;
  stateOrProvince?: string;
  country?: string;
  coordinates: number[];
  address: string;
  postedById: string;
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

  const locationData: LocationData[] = [];

  geocodedLocations.forEach((geodata) => {
    const randomUser = joinData.users[Math.floor(Math.random() * joinData.users.length)];

    const city = geodata.text;
    const postedById = randomUser.id;
    const stateOrProvince = geodata.context?.find((c) => c.id.startsWith('region'))?.text;
    const country = geodata.context?.find((c) => c.id.startsWith('country'))?.text;
    const coordinates = geodata.center;
    const address = geodata.place_name;

    locationData.push({
      city,
      stateOrProvince,
      country,
      coordinates,
      address,
      postedById,
    });
  });

  await prisma.location.createMany({ data: locationData, skipDuplicates: true });

  return prisma.location.findMany();
};

export default createNewLocations;
