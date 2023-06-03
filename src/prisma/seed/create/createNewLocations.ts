/* eslint-disable import/no-extraneous-dependencies */
import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import DBClient from '../../DBClient';
import canadianCities from '../util/canadianCities';

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
  createdAt: Date;
}

const createNewLocations = async ({
  numberOfLocations,
  joinData,
}: CreateNewLocationsArgs) => {
  const prisma = DBClient.instance;

  const locationData: LocationData[] = [];

  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < numberOfLocations; i++) {
    const randomIndex = Math.floor(Math.random() * canadianCities.length);
    const randomCity = canadianCities[randomIndex];
    const randomUser = joinData.users[Math.floor(Math.random() * joinData.users.length)];
    canadianCities.splice(randomIndex, 1);

    locationData.push({
      address: randomCity.city,
      city: randomCity.city,
      coordinates: [randomCity.longitude, randomCity.latitude],
      createdAt: faker.date.past({ years: 1 }),
      postedById: randomUser.id,
      stateOrProvince: randomCity.province,
      country: 'Canada',
    });
  }

  await prisma.location.createMany({ data: locationData, skipDuplicates: true });

  return prisma.location.findMany();
};

export default createNewLocations;
